const express = require('express')
const router = express.Router()
const Joi = require('joi')

const { getProfile } = require('../middleware/getProfile')
const adminController = require('./adminController')
const endpointHandler = require('../endpointHandler')

/*
 * It gets the best profession, the one that generated the best earnings in a given date range
 */
router.get(
    '/best-profession',
    getProfile,
    endpointHandler(adminController.getBestProfession, {
        querySchema: Joi.object({
            start: Joi.date().iso(),
            end: Joi.date().iso(),
        }),
    })
)

/*
 * It gets the best clients, the ones that paid the most for a job
 */
router.get(
    '/best-clients',
    getProfile,
    endpointHandler(adminController.getBestClients, {
        querySchema: Joi.object({
            start: Joi.date().iso(),
            end: Joi.date().iso(),
            limit: Joi.number().integer().positive(),
        }),
    })
)

module.exports = router
