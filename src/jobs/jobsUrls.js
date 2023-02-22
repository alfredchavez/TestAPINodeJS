const express = require('express')
const router = express.Router()

const { getProfile } = require('../middleware/getProfile')
const jobsController = require('./jobsController')
const endpointHandler = require('../endpointHandler')

// Jobs
router.get('/unpaid', getProfile, endpointHandler(jobsController.getUnpaidJobs))

router.post(
    '/:job_id/pay',
    getProfile,
    endpointHandler(jobsController.payForJob)
)

module.exports = router
