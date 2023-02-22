// Contracts
const express = require('express')
const router = express.Router()

const { getProfile } = require('../middleware/getProfile')
const contractsController = require('./contractsController')
const endpointHandler = require('../endpointHandler')

router.get(
    '/:id',
    getProfile,
    endpointHandler(contractsController.getContractById)
)

router.get('/', getProfile, endpointHandler(contractsController.getContracts))

module.exports = router
