const sequelize = require('sequelize')
const Op = sequelize.Op
const { Contract, Job, Profile } = require('../model')

/*
 * Retrieves the profession that obtained more earnings(have been paid the most) for a give date range
 * @param {Date} startDate Start date to filter the job payment dates
 * @param {Date} endDate End date to filter the job payment dates
 * @return {Object} Returns an object containing the the profession with more earnings and the earnings it has obtained
 */
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
                      [Op.and]: [
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

/*
 * Retrieves the clients that paid the most for a job, for a given date range and limit
 * @param {Date} startDate Start date to filter the job payment dates
 * @param {Date} endDate End date to filter the job payment dates
 * @param {Number} limit Integer that defined the max number of clients to retrieve
 * @return {Object} Returns a list with the best clients, each element contains client's full name, how much
 *                  it has paid for a job and its id
 */
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
                      [Op.and]: [
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
