const express = require('express')
const router = express.Router()

const { getProfile } = require('../middleware/getProfile')
const adminController = require('./adminController')
const endpointHandler = require('../endpointHandler')

//Admin
router.get(
    '/best-profession',
    getProfile,
    endpointHandler(adminController.getBestProfession)
)

router.get(
    '/best-clients',
    getProfile,
    endpointHandler(adminController.getBestClients)
)

module.exports = router
