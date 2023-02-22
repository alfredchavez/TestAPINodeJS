const contractsService = require('./contractsService')

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

const getContracts = async (req, res) => {
    const profile = req.profile
    const contracts =
        await contractsService.getNonTerminatedContractsRelatedToProfile(
            profile.id
        )
    res.json(contracts)
}

module.exports = { getContractById, getContracts }
