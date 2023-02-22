const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')

/*
 * Retrieves all the unpaid in_progress jobs that are related to a profile(either as a Contractor or Client)
 * @param {Number} profileId Profile id used to filter the jobs
 * @param {Object} Return requested jobs
 */
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

/*
 * Retrieves a Job by its id, only if its contract client matches the passed profile id
 * @param {Number} id Job id
 * @param {Number} profileId Profile id used to filter the job
 * @param {Object} Return requested job
 */
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

/*
 * Performs a job payment, moving the job pay amount from the client balance to the contractor balance
 * @param {Number} id Job id
 * @param {Number} profile Profile(Client) that represents the user that performs the payment
 */
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
