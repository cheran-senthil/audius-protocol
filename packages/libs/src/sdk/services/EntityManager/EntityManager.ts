import fetch, { Headers } from 'cross-fetch'
import type Web3Type from 'web3'
import type { TransactionReceipt } from 'web3-core'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'

import { abi as EntityManagerABI } from '../../../data-contracts/ABIs/EntityManager.json'
import * as signatureSchemas from '../../../data-contracts/signatureSchemas'
import { productionConfig } from '../../config/production'
import { mergeConfigWithDefaults } from '../../utils/mergeConfigs'
import Web3 from '../../utils/web3'
import type { DiscoveryNodeSelectorService } from '../DiscoveryNodeSelector'
import type { LoggerService } from '../Logger'

import { getDefaultEntityManagerConfig } from './getDefaultConfig'
import {
  BlockConfirmation,
  EntityManagerConfig,
  EntityManagerConfigInternal,
  EntityManagerService,
  ManageEntityOptions
} from './types'

const DEFAULT_GAS_LIMIT = 2000000
const CONFIRMATION_POLLING_INTERVAL = 2000
const CONFIRMATION_TIMEOUT = 45000

export class EntityManager implements EntityManagerService {
  /**
   * Configuration passed in by consumer (with defaults)
   */
  private readonly config: EntityManagerConfigInternal

  private readonly discoveryNodeSelector: DiscoveryNodeSelectorService

  private readonly contract: Contract
  private readonly web3: Web3Type
  private readonly logger: LoggerService

  constructor(config: EntityManagerConfig) {
    this.config = mergeConfigWithDefaults(
      config,
      getDefaultEntityManagerConfig(productionConfig)
    )
    this.discoveryNodeSelector = config.discoveryNodeSelector
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(this.config.web3ProviderUrl, {
        timeout: 10000
      })
    )
    this.contract = new this.web3.eth.Contract(
      EntityManagerABI as AbiItem[],
      this.config.contractAddress
    )
    this.logger = this.config.logger.createPrefixedLogger('[entity-manager]')
  }

  /**
   * Calls the manage entity method on chain to update some data
   */
  public async manageEntity({
    userId,
    entityType,
    entityId,
    action,
    metadata = '',
    auth,
    confirmationTimeout = CONFIRMATION_TIMEOUT,
    skipConfirmation = false
  }: ManageEntityOptions): Promise<
    Pick<TransactionReceipt, 'blockHash' | 'blockNumber'>
  > {
    const nonce = await signatureSchemas.getNonce()
    const chainId = Number(await this.web3.eth.getChainId())
    const signatureData = signatureSchemas.generators.getManageEntityData(
      chainId,
      this.config.contractAddress,
      userId,
      entityType,
      entityId,
      action,
      metadata,
      nonce
    )

    const senderAddress = await auth.getAddress()
    const signature = await auth.signTransaction(signatureData)

    const method = await this.contract.methods.manageEntity(
      userId,
      entityType,
      entityId,
      action,
      metadata,
      nonce,
      signature
    )

    const url = `${await this.getRelayEndpoint()}/relay`
    this.logger.info(`Making relay request to ${url}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        contractAddress: this.config.contractAddress,
        contractRegistryKey: 'EntityManager',
        encodedABI: method.encodeABI(),
        // Gas limit not really needed with ACDC
        gasLimit: DEFAULT_GAS_LIMIT,
        senderAddress
      })
    })
    const jsonResponse = await response.json()
    if (response.ok) {
      if (!skipConfirmation) {
        await this.confirmWrite({
          blockHash: jsonResponse.receipt.blockHash,
          blockNumber: jsonResponse.receipt.blockNumber,
          confirmationTimeout
        })
      }

      return {
        blockHash: jsonResponse.receipt.blockHash,
        blockNumber: jsonResponse.receipt.blockNumber
      }
    } else if (response.status === 429) {
      this.logger.error(
        'API Rate Limit Exceeded: You have exceeded the allowed number of requests for this action. Please wait and try again later. If you require a higher rate limit, please send an email to api@audius.co with your request, detailing the reasons and expected usage.'
      )
      throw new Error(
        'Error making relay request: API Rate Limit Exceeded. If you require a higher rate limit, please send an email to api@audius.co with your request.'
      )
    } else {
      throw new Error(
        `Error making relay request${
          jsonResponse?.error?.message ? `: ${jsonResponse.error.message}` : '.'
        }`
      )
    }
  }

  /**
   * Confirms a write by polling for the block to be indexed by the selected
   * discovery node
   */
  public async confirmWrite({
    blockHash,
    blockNumber,
    confirmationTimeout = CONFIRMATION_TIMEOUT,
    confirmationPollingInterval = CONFIRMATION_POLLING_INTERVAL
  }: {
    blockHash: string
    blockNumber: number
    confirmationTimeout?: number
    confirmationPollingInterval?: number
  }) {
    this.logger.info('Confirming write')
    const confirmBlock = async () => {
      const endpoint = await this.discoveryNodeSelector.getSelectedEndpoint()
      const {
        data: { block_passed }
      } = await (
        await fetch(
          `${endpoint}/block_confirmation?blocknumber=${blockNumber}&blockhash=${blockHash}`
        )
      ).json()

      return block_passed
        ? BlockConfirmation.CONFIRMED
        : BlockConfirmation.UNKNOWN
    }

    let confirmation: BlockConfirmation = await confirmBlock()

    const start = Date.now()
    while (confirmation === BlockConfirmation.UNKNOWN) {
      if (Date.now() - start > confirmationTimeout) {
        throw new Error(
          `Could not confirm write within ${confirmationTimeout}ms`
        )
      }
      await new Promise((resolve) =>
        setTimeout(resolve, confirmationPollingInterval)
      )
      confirmation = await confirmBlock()
    }

    this.logger.info('Write confirmed')
    return true
  }

  public async getCurrentBlock() {
    const currentBlockNumber = await this.web3.eth.getBlockNumber()
    return (await this.web3.eth.getBlock(currentBlockNumber)) as {
      timestamp: number
    }
  }

  public async getRelayEndpoint(): Promise<string> {
    const discoveryEndpoint =
      await this.discoveryNodeSelector.getSelectedEndpoint()
    if (discoveryEndpoint === null) {
      return this.config.identityServiceUrl
    }
    return discoveryEndpoint
  }
}
