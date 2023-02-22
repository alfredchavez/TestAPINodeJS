const jobsService = require('./jobsService')

/*
 * Controller to retrieve all the unpaid jobs related to the profile that performed the request
 * @param {*} req Request
 * @param {*} res Response
 */
const getUnpaidJobs = async (req, res) => {
    const jobs = await jobsService.getUnpaidJobsForProfile(req.profile.id)
    res.json(jobs)
}

/*
 * Controller to perform a job payment, this only can be done by a client
 * @param {*} req Request
 * @param {*} res Response
 */
const payForJob = async (req, res) => {
    const profile = req.profile
    const id = req.params.job_id
    if (profile.type !== 'client')
        throw {
            name: 'ValidationError',
            message: 'Only a client can perform a job payment',
        }
    await jobsService.payJob(id, profile)
    res.json({})
}

module.exports = { getUnpaidJobs, payForJob }
