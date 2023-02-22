const jobsService = require('./jobsService')

const getUnpaidJobs = async (req, res) => {
    const jobs = await jobsService.getUnpaidJobsForProfile(req.profile.id)
    res.json(jobs)
}

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
