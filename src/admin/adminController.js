const moment = require('moment')
const adminService = require('./adminService')

const getBestProfession = async (req, res) => {
    const startDate = req.query.start
        ? moment(req.query.start).startOf('day').toDate()
        : undefined
    const endDate = req.query.end
        ? moment(req.query.end).endOf('day').toDate()
        : undefined

    const bestProfession = await adminService.getBestProfession(
        startDate,
        endDate
    )
    res.json(bestProfession)
}

const getBestClients = async (req, res) => {
    const startDate = req.query.start
        ? moment(req.query.start).startOf('day').toDate()
        : undefined
    const endDate = req.query.end
        ? moment(req.query.end).endOf('day').toDate()
        : undefined
    const limit = req.query.limit ?? 2
    const topClients = await adminService.getBestClients(
        startDate,
        endDate,
        limit
    )
    res.json(topClients)
}

module.exports = { getBestClients, getBestProfession }
