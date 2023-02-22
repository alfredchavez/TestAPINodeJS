const express = require('express')
const router = express.Router()
const Joi = require('joi')

const { getProfile } = require('../middleware/getProfile')
const jobsController = require('./jobsController')
const endpointHandler = require('../endpointHandler')

/*
 * Retrieves all the unpaid jobs related to a profile
 */
router.get(
    '/unpaid',
    getProfile,
    endpointHandler(jobsController.getUnpaidJobs, {})
)

/*
 * It pays for a given job(by id)
 */
router.post(
    '/:job_id/pay',
    getProfile,
    endpointHandler(jobsController.payForJob, {
        paramsSchema: Joi.object({
            job_id: Joi.number().integer().min(1).required(),
        }),
    })
)

module.exports = router
