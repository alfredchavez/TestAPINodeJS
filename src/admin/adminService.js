const sequelize = require('sequelize')
const Op = sequelize.Op
const { Contract, Job, Profile } = require('../model')

const getBestProfession = async (startDate, endDate) => {
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
        throw {
            name: 'ValidationError',
            message: 'Could not find any profession',
        }
    return {
        earnings: bestProfession.earnings,
        profession: bestProfession.profession,
    }
}

const getBestClients = async (startDate, endDate, limit) => {
    const bestClients = await Job.findAll({
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
    return bestClients.map((client) => ({
        fullName: client.fullName,
        paid: client.paid,
        id: client['Contract.Client.id'],
    }))
}

module.exports = {
    getBestClients,
    getBestProfession,
}
