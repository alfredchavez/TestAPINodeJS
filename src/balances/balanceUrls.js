const express = require('express')
const router = express.Router()

const { getProfile } = require('../middleware/getProfile')
const balancesController = require('./balancesController')
const endpointHandler = require('../endpointHandler')

router.post(
    '/deposit/:userId',
    getProfile,
    endpointHandler(balancesController.depositToUser)
)

module.exports = router
