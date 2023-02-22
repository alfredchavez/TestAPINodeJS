const moment = require('moment')
const adminService = require('./adminService')

/*
 * Controller to get the best profession, the one that generateed the best earnings in a given date range
 * @param {*} req Request
 * @param {*} res Response
 */
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

/*
 * Controller to get the best Clients, the ones that paid the most for a job
 * @param {*} req Request
 * @param {*} res Response
 */
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
