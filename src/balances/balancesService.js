const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')

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

module.exports = { getTotalAmountClientHasToPay, depositToUser }
