const { Contract } = require('../model')
const { Op } = require('sequelize')

/*
 * Retrieves a Contract by its id, but only if it is related to a given profile(wheter it is a client or contractor)
 * @param {Number} id ContractId
 * @param {Number} profileId Profile id used to filter the contract
 * @return {Object} Returns the requested contract
 */
const getContractByIdRelatedToProfile = async (id, profileId) => {
    return await Contract.findOne({
        where: {
            id,
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
        },
    })
}

/*
 * Retrieves all the Contracts related to a given profile(wheter it is a client or contractor)
 * @param {Number} profileId Profile id used to filter the contracts
 * @return {Object} Returns all non-terminated contracts related to a profile
 */
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
