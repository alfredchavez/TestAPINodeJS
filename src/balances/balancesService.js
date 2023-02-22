const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')

/*
 * Calculates how much a client has to pay for the created jobs that are in progress
 * @param {Number} clientId Client Id
 * @return {Object} Returns the sum of all the jobs(in_progress/active?) prices that a client has to pay
 */
const getTotalAmountClientHasToPay = async (clientId) => {
    return await Job.sum('price', {
        where: {
            paid: { [Op.not]: true },
        },
        include: {
            model: Contract,
            where: {
                ClientId: clientId,
                status: 'in_progress',
            },
        },
    })
}

/*
 * Deposits an amount of money, discounting it from a user and adding this value to the target user balance
 * @param {Object} fromUser Client that performs the deposit
 * @param {Object} toUser Client that received the deposit
 * @param {Number} amount Amount to be deposited
 */
const depositToUser = async (fromUser, toUser, amount) => {
    const sumOfJobs = await getTotalAmountClientHasToPay(fromUser.id)

    if (amount > fromUser.balance)
        throw {
            name: 'ValidationError',
            message: 'Client does not have enough balance to make the deposit',
        }
    if (amount > sumOfJobs / 4)
        throw {
            name: 'ValidationError',
            message:
                'Client cannot deposit more than 25% of total of unpaid jobs',
        }

    await sequelize.transaction(async (t) => {
        await Promise.all([
            Profile.decrement(
                { balance: amount },
                { where: { id: fromUser.id }, transaction: t }
            ),
            Profile.increment(
                { balance: amount },
                { where: { id: toUser.id }, transaction: t }
            ),
        ])
    })
}

module.exports = { depositToUser }
