const balancesService = require('./balancesService')

const depositToUser = async (req, res) => {
    const { Profile } = req.app.get('models')
    const clientThatDeposits = req.profile
    if (clientThatDeposits.type !== 'client') {
        throw {
            name: 'ValidationError',
            message: 'Only a client can use this endpoint',
        }
    }
    // TODO move this to a profile service (?)
    const clientThatReceivesDeposit = await Profile.findOne({
        where: { id: req.params.userId },
    })
    if (!clientThatReceivesDeposit)
        throw {
            name: 'ValidationError',
            message: `Client with id ${req.params.userId} not found`,
        }
    if (clientThatDeposits.type !== 'client') {
        throw {
            name: 'ValidationError',
            message: 'You can only make deposits to a client',
        }
    }

    await balancesService.depositToUser(
        clientThatDeposits,
        clientThatReceivesDeposit,
        req.body.amount
    )
    res.json({})
}

module.exports = { depositToUser }
