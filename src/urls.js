const express = require('express')
const router = express.Router()

router.use('/admin', require('./admin/adminUrls'))
router.use('/balances', require('./balances/balanceUrls'))
router.use('/contracts', require('./contracts/contractsUrls'))
router.use('/jobs', require('./jobs/jobsUrls'))

module.exports = router
