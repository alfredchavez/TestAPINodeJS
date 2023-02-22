// Contracts
const express = require('express')
const router = express.Router()
const Joi = require('joi')

const { getProfile } = require('../middleware/getProfile')
const contractsController = require('./contractsController')
const endpointHandler = require('../endpointHandler')

router.get(
    '/:id',
    getProfile,
    endpointHandler(contractsController.getContractById, {
        paramsSchema: Joi.object({
            id: Joi.number().integer().min(1).required(),
        }),
    })
)

router.get(
    '/',
    getProfile,
    endpointHandler(contractsController.getContracts, {})
)

module.exports = router
