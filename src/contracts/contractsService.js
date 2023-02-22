const { Contract } = require('../model')
const { Op } = require('sequelize')

const getContractByIdRelatedToProfile = async (id, profileId) => {
    return await Contract.findOne({
        where: {
            id,
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
        },
    })
}

const getNonTerminatedContractsRelatedToProfile = async (profileId) => {
    return await Contract.findAll({
        where: {
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
            status: { [Op.ne]: 'terminated' },
        },
    })
}

module.exports = {
    getContractByIdRelatedToProfile,
    getNonTerminatedContractsRelatedToProfile,
}
