const handleEndpoint =
    (controller, { bodySchema, paramsSchema, querySchema }) =>
    async (req, res, next) => {
        try {
            validateRequest(req, { bodySchema, paramsSchema, querySchema })
            await controller(req, res)
        } catch (err) {
            return next(err)
        }
    }

const validateSchema = (objectToValidate, schema) => {
    const { value, error } = schema.validate(objectToValidate)
    if (error)
        throw {
            name: 'ValidationError',
            details: error.details,
        }
    return value
}

const validateRequest = (req, { bodySchema, paramsSchema, querySchema }) => {
    if (paramsSchema) validateSchema(req.params, paramsSchema)
    if (querySchema) validateSchema(req.query, querySchema)
    if (bodySchema) validateSchema(req.body, bodySchema)
}

module.exports = handleEndpoint
