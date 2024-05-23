import { Commitment, Connection, SendOptions, TransactionConfirmationStrategy, VersionedTransaction } from "@solana/web3.js"
import { connections, getConnection } from "./connections"
import { cacheTransaction, getCachedDiscoveryNodes } from "../redis"
import { Logger } from "pino"
import { logger as defaultLogger } from "../logger"
import { personalSign } from "eth-sig-util"
import { config } from "../config"
import { delay } from "./delay"

const RETRY_DELAY_MS = 2 * 1000
const RETRY_TIMEOUT_MS = 60 * 1000

/**
 * Forwards the transaction response to other Solana Relays on other discovery
 * nodes so that they can cache it to lighten the RPC load on indexing.
 */
const forwardTransaction = async (logger: Logger, transaction: string) => {
    const endpoints = await getCachedDiscoveryNodes()
    logger.info(`Forwarding to ${endpoints.length} endpoints...`)
    const body = JSON.stringify({ transaction })
    await Promise.all(
        endpoints
            .filter((p) => p.endpoint !== config.endpoint)
            .map(({ endpoint }) =>
                fetch(`${endpoint}/solana/cache`, {
                    method: 'POST',
                    body,
                    headers: {
                        'content-type': 'application/json',
                        'Discovery-Signature': personalSign(config.delegatePrivateKey, {
                            data: body
                        })
                    }
                })
                    .then((res) => {
                        if (res.ok) {
                            logger.info(
                                { endpoint, status: res.status },
                                `Forwarded successfully`
                            )
                        } else {
                            logger.warn(
                                { endpoint },
                                `Failed to forward transaction to endpoint: ${res.statusText}`
                            )
                        }
                    })
                    .catch((e) => {
                        logger.warn(
                            { endpoint },
                            `Failed to forward transaction to endpoint: ${e}`
                        )
                    })
            )
    )
}

/**
 * Sends the transaction repeatedly to all configured RPCs until
 * it's been confirmed with the given commitment level, expires,
 * or times out.
 */
export const sendTransactionWithRetries = async ({
    transaction,
    commitment,
    confirmationStrategy,
    sendOptions,
    logger
}: {
    transaction: VersionedTransaction
    commitment: Commitment
    confirmationStrategy: TransactionConfirmationStrategy
    sendOptions?: SendOptions
    logger: Logger
}) => {
    const serializedTx = transaction.serialize()

    let retryCount = 0
    const createRetryPromise = async (signal: AbortSignal): Promise<void> => {
        while (!signal.aborted) {
            Promise.any(
                connections.map((connection) =>
                    connection.sendRawTransaction(serializedTx, {
                        skipPreflight: true,
                        maxRetries: 0,
                        ...sendOptions
                    })
                )
            ).catch((error) => {
                logger.warn({ error, retryCount }, `Failed retry...`)
            })
            await delay(RETRY_DELAY_MS)
            retryCount++
        }
    }

    const createTimeoutPromise = async (signal: AbortSignal) => {
        await delay(RETRY_TIMEOUT_MS)
        if (!signal.aborted) {
            logger.error('Timed out sending transaction')
        }
    }

    const start = Date.now()
    const connection = connections[0]
    const abortController = new AbortController()
    try {
        if (!sendOptions?.skipPreflight) {
            const simulatedRes = await connection.simulateTransaction(transaction)
            if (simulatedRes.value.err) {
                logger.error(
                    { error: simulatedRes.value.err },
                    'Transaction simulation failed'
                )
                throw simulatedRes.value.err
            }
        }

        const res = await Promise.race([
            createRetryPromise(abortController.signal),
            connection.confirmTransaction(
                { ...confirmationStrategy, abortSignal: abortController.signal },
                commitment
            ),
            createTimeoutPromise(abortController.signal)
        ])

        if (!res || res.value.err) {
            throw res?.value.err ?? 'Transaction polling timed out.'
        }
        logger.info({ commitment }, 'Transaction sent successfully')
        return confirmationStrategy.signature
    } catch (error) {
        logger.error({ error }, 'Transaction failed to send')
        throw error
    } finally {
        // Stop the other operations
        abortController.abort()
        const end = Date.now()
        const elapsedMs = end - start
        logger.info(
            { elapsedMs, retryCount },
            'sendTransactionWithRetries completed.'
        )
    }
}

/**
 * Confirms a transaction if skipConfirmation is false or not passed. Stores the given transaction in 
 * redis and then broadcasts it to all other discovery nodes using forwardTransaction. 
 */
export const broadcastTransaction = async ({ signature, skipConfirmation = false, logger }: { signature: string, skipConfirmation?: boolean, logger?: Logger }) => {
    logger = logger !== undefined ? logger : defaultLogger
    const connection = getConnection()
    if (!skipConfirmation) {
        // Confirm, fetch, cache and forward after success response.
        // The transaction may be confirmed from specifying commitment before,
        // but that may have been a different RPC. So confirm again.
        logger.info(`Confirming transaction before fetching...`)
        const strategy = await connection.getLatestBlockhash()
        const confirmationStrategy = { ...strategy, signature }
        await connection.confirmTransaction(confirmationStrategy, 'confirmed')
    }
    logger.info('Fetching transaction for caching...')
    // Dangerously relying on the internals of connection to do the fetch.
    // Calling connection.getTransaction will result in the library parsing the
    // results and getting us back our object again, but we need the raw JSON
    // for Solders to know what we're talking about when indexing.
    const rpcResponse = await (
        connection as Connection & {
            _rpcRequest: (
                methodName: string,
                args: Array<unknown>
            ) => Promise<unknown>
        }
    )._rpcRequest('getTransaction', [
        signature,
        {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
            encoding: 'json'
        }
    ])
    const formattedResponse = JSON.stringify(rpcResponse)
    logger.info('Caching transaction...')
    await cacheTransaction(signature, formattedResponse)
    logger.info('Forwarding transaction to other nodes to cache...')
    await forwardTransaction(logger, formattedResponse)
}
