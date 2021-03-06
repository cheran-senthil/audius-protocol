const express = require('express')
const { handleResponse, successResponse, errorResponseBadRequest, handleResponseWithHeartbeat } = require('../../apiHelpers')
const { healthCheck, healthCheckDuration } = require('./healthCheckComponentService')
const { syncHealthCheck } = require('./syncHealthCheckComponentService')
const { serviceRegistry } = require('../../serviceRegistry')
const { sequelize } = require('../../models')

const { recoverWallet } = require('../../apiSigning')

const config = require('../../config')

const router = express.Router()

// 5 minutes in ms is the maximum age of a timestamp sent to /health_check/duration
const MAX_HEALTH_CHECK_TIMESTAMP_AGE_MS = 300000

// Controllers

/**
 * Controller for `health_check` route, calls
 * `healthCheckComponentService`.
 */
const healthCheckController = async (req) => {
  const logger = req.logger
  const response = await healthCheck(serviceRegistry, logger, sequelize)
  return successResponse(response)
}

/**
 * Controller for `health_check/sync` route, calls
 * syncHealthCheckController
 */
const syncHealthCheckController = async () => {
  const response = await syncHealthCheck(serviceRegistry)
  return successResponse(response)
}

/**
 * Controller for health_check/duration route
 * Calls healthCheckComponentService
 */
const healthCheckDurationController = async (req) => {
  let { timestamp, randomBytes, signature } = req.query
  if (!timestamp || !randomBytes || !signature) return errorResponseBadRequest('Missing required query parameters')

  const recoveryObject = { randomBytesToSign: randomBytes, timestamp }
  const recoveredPublicWallet = recoverWallet(recoveryObject, signature).toLowerCase()
  const recoveredTimestampDate = new Date(timestamp)
  const currentTimestampDate = new Date()
  const requestAge = currentTimestampDate - recoveredTimestampDate
  if (requestAge >= MAX_HEALTH_CHECK_TIMESTAMP_AGE_MS) {
    throw new Error(`Submitted timestamp=${recoveredTimestampDate}, current timestamp=${currentTimestampDate}. Maximum age =${MAX_HEALTH_CHECK_TIMESTAMP_AGE_MS}`)
  }
  const delegateOwnerWallet = config.get('delegateOwnerWallet').toLowerCase()
  if (recoveredPublicWallet !== delegateOwnerWallet) {
    throw new Error("Requester's public key does does not match Creator Node's delegate owner wallet.")
  }
  let response = await healthCheckDuration()
  return successResponse(response)
}

/**
 * Controller for `health_check/verbose` route
 * Calls `healthCheckComponentService`.
 *
 * @todo Add disk usage, current load, and/or node details to response.
 * Will be used for cnode selection.
 */
const healthCheckVerboseController = async (req) => {
  const logger = req.logger
  const healthCheckResponse = await healthCheck(serviceRegistry, logger, sequelize)

  // TODO: add disk usage, current load, and/or node details to response
  return successResponse({
    ...healthCheckResponse,
    country: config.get('serviceCountry'),
    latitude: config.get('serviceLatitude'),
    longitude: config.get('serviceLongitude')
  })
}

// Routes

router.get('/health_check', handleResponse(healthCheckController))
router.get('/health_check/sync', handleResponse(syncHealthCheckController))
router.get('/health_check/duration', handleResponse(healthCheckDurationController))
router.get('/health_check/duration/heartbeat', handleResponseWithHeartbeat(healthCheckDurationController))
router.get('/health_check/verbose', handleResponse(healthCheckVerboseController))

module.exports = router
