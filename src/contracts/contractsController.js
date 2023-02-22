const contractsService = require('./contractsService')

/*
 * Controller to retrieve a contract by its id, only if related to the user performing the request
 * @param {*} req Request
 * @param {*} res Response
 */
const getContractById = async (req, res) => {
    const { id } = req.params
    const profile = req.profile
    const contract = await contractsService.getContractByIdRelatedToProfile(
        id,
        profile.id
    )
    if (!contract)
        throw {
            name: 'NotFoundError',
            message: 'Contract does not exist or you do not have access to it',
        }
    res.json(contract)
}

/*
 * Controller to get all non-terminated contracts related to the profile performing the request
 * @param {*} req Request
 * @param {*} res Response
 */
const getContracts = async (req, res) => {
    const profile = req.profile
    const contracts =
        await contractsService.getNonTerminatedContractsRelatedToProfile(
            profile.id
        )
    res.json(contracts)
}

module.exports = { getContractById, getContracts }
