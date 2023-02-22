/*
 * It handles captured exceptions/errors
 * @param {object} err captured Error/exception
 * @param {object} req Request
 * @param {object} res Response
 */
const errorHandler = (err, req, res, next) => {
    // TODO use a best way/lib to log errors
    console.error(err)

    if (err.name === 'NotFoundError') {
        return res.status(400).send({
            type: 'NotFoundError',
            message: err.message || err.details?.message,
            details: err.details,
        })
    }
    if (err.name === 'ValidationError') {
        return res.status(422).send({
            type: 'ValidationError',
            message: err.message || err.details?.message,
            details: err.details,
        })
    }
    res.status(500).send({
        type: 'Internal error',
        message: err?.message || err.details?.message,
        details: err?.details,
    })
}

module.exports = errorHandler
