/*
 * It performs request validations and calls the passed controller in a try-catch so it can capture the errors
 * @param {function} controller Controller to execute
 * @param {object} schemas.bodySchema Schema to validate request body
 * @param {object} schemas.paramsSchema Schema to validate request url params
 * @param {object} schemas.querySchema Schema to validate query params
 */
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

/*
 * It performs an schema validation for an object
 * @param {object} objectToValidate Object to validate using Schema
 * @param {object} Joi schema Schema to validate an object
 * @return {object} Validated object
 */
const validateSchema = (objectToValidate, schema) => {
    const { value, error } = schema.validate(objectToValidate)
    if (error)
        throw {
            name: 'ValidationError',
            details: error.details,
        }
    return value
}

/*
 * It performs request validations
 * @param {object} req Request
 * @param {object} schemas.bodySchema Schema to validate request body
 * @param {object} schemas.paramsSchema Schema to validate request url params
 * @param {object} schemas.querySchema Schema to validate query params
 */
const validateRequest = (req, { bodySchema, paramsSchema, querySchema }) => {
    if (paramsSchema) validateSchema(req.params, paramsSchema)
    if (querySchema) validateSchema(req.query, querySchema)
    if (bodySchema) validateSchema(req.body, bodySchema)
}

module.exports = handleEndpoint
