// Contracts
const express = require('express')
const router = express.Router()
const Joi = require('joi')

const { getProfile } = require('../middleware/getProfile')
const contractsController = require('./contractsController')
const endpointHandler = require('../endpointHandler')

/*
 * Retrieves a contract by its id, only if it is related to the user performing the request
 */
router.get(
    '/:id',
    getProfile,
    endpointHandler(contractsController.getContractById, {
        paramsSchema: Joi.object({
            id: Joi.number().integer().min(1).required(),
        }),
    })
)

/*
 * Retrieves all the non-terminated contracts related to the user performing the request
 */
router.get(
    '/',
    getProfile,
    endpointHandler(contractsController.getContracts, {})
)

module.exports = router
