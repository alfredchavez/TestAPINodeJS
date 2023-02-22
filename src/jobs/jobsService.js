const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')

const getUnpaidJobsForProfile = async (profileId) => {
    return await Job.findAll({
        where: {
            paid: { [Op.not]: true },
        },
        include: {
            model: Contract,
            where: {
                [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
                status: 'in_progress',
            },
        },
    })
}

const getJobByIdForProfile = async (id, profileId) => {
    return await Job.findOne({
        where: {
            id,
        },
        include: {
            model: Contract,
            where: {
                [Op.or]: [{ ClientId: profileId }],
                status: 'in_progress',
            },
        },
    })
}

const payJob = async (id, profile) => {
    const job = await getJobByIdForProfile(id, profile.id)
    if (!job)
        throw {
            name: 'NotFoundError',
            message: 'Job does not exist or you do not have access to it',
        }
    if (job.paid)
        throw { name: 'ValidationError', message: 'Job has already been paid' }

    const amountToBePaid = job.price
    const clientBalance = profile.balance

    if (clientBalance < amountToBePaid)
        throw {
            name: 'ValidationError',
            message: 'Client does not have enough balance to pay for this job',
        }

    await sequelize.transaction(async (t) => {
        await Promise.all([
            Profile.decrement(
                { balance: amountToBePaid },
                { where: { id: job.Contract.ClientId }, transaction: t }
            ),
            Profile.increment(
                { balance: amountToBePaid },
                { where: { id: job.Contract.ContractorId }, transaction: t }
            ),
            Job.update({ paid: true }, { where: { id }, transaction: t }),
        ])
    })
}

module.exports = { getUnpaidJobsForProfile, payJob }
