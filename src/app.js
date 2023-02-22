const express = require('express')
const moment = require('moment')
const bodyParser = require('body-parser')
const { sequelize } = require('./model')
const { Op } = require('sequelize')
const { getProfile } = require('./middleware/getProfile')
const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// Contracts
app.get('/contracts/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const profile = req.profile
    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [{ ClientId: profile.id }, { ContractorId: profile.id }],
        },
    })
    if (!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const profile = req.profile
    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [{ ClientId: profile.id }, { ContractorId: profile.id }],
            status: { [Op.ne]: 'terminated' },
        },
    })
    res.json(contracts)
})

// Jobs
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { Contract, Job } = req.app.get('models')
    const profile = req.profile
    const jobs = await Job.findAll({
        where: {
            paid: { [Op.not]: true },
        },
        include: {
            model: Contract,
            where: {
                [Op.or]: [
                    { ClientId: profile.id },
                    { ContractorId: profile.id },
                ],
                status: 'in_progress',
            },
        },
    })
    res.json(jobs)
})

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const profile = req.profile
    const id = req.params.job_id
    const job = await Job.findOne({
        where: {
            id,
        },
        include: {
            model: Contract,
            where: {
                [Op.or]: [{ ClientId: profile.id }],
                status: 'in_progress',
            },
        },
    })
    if (!job) return res.status(400).end()
    if (job.paid)
        return res.status(500).send({ message: 'Job has already been paid' })

    const amountToBePaid = job.price
    const clientBalance = profile.balance

    if (clientBalance < amountToBePaid)
        return res.status(500).send({
            message: 'Client does not have enough balance to pay for this job',
        })

    // Perform payment( TODO should use transaction)
    await Profile.decrement(
        { balance: amountToBePaid },
        { where: { id: job.Contract.ClientId } }
    )
    await Profile.increment(
        { balance: amountToBePaid },
        { where: { id: job.Contract.ContractorId } }
    )
    await Job.update({ paid: true }, { where: { id } })
    res.json({})
})

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const clientThatDeposits = req.profile
    const clientThatReceivesDeposit = await Profile.findOne({
        where: { id: req.params.userId },
    })
    if (!clientThatReceivesDeposit)
        return res
            .status(400)
            .message(`Client with id ${req.params.userId} not found`)

    const sumOfJobs = await Job.sum('price', {
        where: {
            paid: { [Op.not]: true },
        },
        include: {
            model: Contract,
            where: {
                ClientId: clientThatDeposits.id,
                status: 'in_progress',
            },
        },
    })
    const amountToBeDeposited = req.body.amount

    if (amountToBeDeposited > clientThatDeposits.balance)
        return res.status(500).send({
            message: 'Client does not have enough balance to make the deposit',
        })
    if (amountToBeDeposited > sumOfJobs / 4)
        return res.status(500).send({
            message:
                'Client cannot deposit more than 25% of total of unpaid jobs',
        })

    // TODO use transaction
    await Profile.decrement(
        { balance: amountToBeDeposited },
        { where: { id: clientThatDeposits.id } }
    )
    await Profile.increment(
        { balance: amountToBeDeposited },
        { where: { id: clientThatReceivesDeposit.id } }
    )
    res.json({})
})

//Admin
app.get('/admin/best-profession', getProfile, async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const startDate = req.query.start
        ? moment(req.query.start).startOf('day').toDate()
        : undefined
    const endDate = req.query.end
        ? moment(req.query.end).endOf('day').toDate()
        : undefined

    const bestProfession = await Job.findOne({
        raw: true,
        attributes: [
            [sequelize.col('profession'), 'profession'],
            [sequelize.fn('SUM', sequelize.col('price')), 'earnings'],
        ],
        where: {
            paid: true,
            ...(startDate || endDate
                ? {
                      [Op.or]: [
                          ...(startDate
                              ? [{ paymentDate: { [Op.gte]: startDate } }]
                              : []),
                          ...(endDate
                              ? [{ paymentDate: { [Op.lte]: endDate } }]
                              : []),
                      ],
                  }
                : {}),
        },
        include: {
            model: Contract,
            include: {
                model: Profile,
                as: 'Contractor',
            },
        },
        group: ['profession'],
        order: [['earnings', 'DESC']],
    })
    if (!bestProfession)
        return res.status(400).send({ message: 'No profession found' })
    res.json({
        earnings: bestProfession.earnings,
        profession: bestProfession.profession,
    })
})

app.get('/admin/best-clients', getProfile, async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const startDate = req.query.start
        ? moment(req.query.start).startOf('day').toDate()
        : undefined
    const endDate = req.query.end
        ? moment(req.query.end).endOf('day').toDate()
        : undefined
    const limit = req.query.limit ?? 2
    const topClients = await Job.findAll({
        raw: true,
        attributes: [
            [sequelize.col('firstName'), 'firstName'],
            [sequelize.literal(`firstName || ' ' || lastName`), 'fullName'],
            [sequelize.col('price'), 'paid'],
        ],
        where: {
            paid: true,
            ...(startDate || endDate
                ? {
                      [Op.or]: [
                          ...(startDate
                              ? [{ paymentDate: { [Op.gte]: startDate } }]
                              : []),
                          ...(endDate
                              ? [{ paymentDate: { [Op.lte]: endDate } }]
                              : []),
                      ],
                  }
                : {}),
        },
        include: {
            model: Contract,
            include: {
                model: Profile,
                as: 'Client',
            },
        },
        order: [['paid', 'DESC']],
        limit,
    })
    res.json(
        topClients.map((client) => ({
            fullName: client.fullName,
            paid: client.paid,
            id: client['Contract.Client.id'],
        }))
    )
})

module.exports = app
