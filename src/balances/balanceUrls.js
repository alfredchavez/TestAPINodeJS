const express = require('express')
const router = express.Router()
const Joi = require('joi')

const { getProfile } = require('../middleware/getProfile')
const balancesController = require('./balancesController')
const endpointHandler = require('../endpointHandler')

router.post(
    '/deposit/:userId',
    getProfile,
    endpointHandler(balancesController.depositToUser, {
        paramsSchema: Joi.object({
            userId: Joi.number().integer().min(1).required(),
        }),
        bodySchema: Joi.object({
            amount: Joi.number().positive().required(),
        }),
    })
)

module.exports = router
