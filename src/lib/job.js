const crypto = require('crypto')

class Job {
  constructor(projectId, stackName, command, savingOutput, storage) {
    this.id = crypto.randomBytes(6).toString('hex')
    this.projectId = projectId
    this.stackName = stackName
    this.command = command
    this.queuedAt = Date.now()
    this.storage = storage
    this.savingOutput = savingOutput
    this.startedAt = undefined
    this.wasKilled = false
  }

  start = () => {
    this.startedAt = Date.now()

    this.storage.set('jobs', this.id, this.toJson())

    return this
  }

  kill = () => {
    this.wasKilled = true

    this.storage.set('jobs', this.id, this.toJson())

    return this
  }

  outputFileName = () => {
    return `${Job.containerOutputPath}/${this.id}.log`
  }

  toJson = () => {
    return {
      id: this.id,
      projectId: this.projectId,
      stackName: this.stackName,
      command: this.command,
      savingOutput: this.savingOutput,
      queuedAt: this.queuedAt,
      startedAt: this.startedAt,
      wasKilled: this.wasKilled
    }
  }
}

Job.containerOutputPath = '/var/log/penguin/jobs/output'

Job.list = (storage, projectId) => {
  const allJobs = storage.list('jobs')

  return Object.values(allJobs)
    .filter(job => job.projectId === projectId)
    .reduce((obj, job) => { obj[job.id] = job; return obj }, {})
}

Job.last = (storage, projectId) => {
  const jobs = Job.list(storage, projectId)
  const ids = Object.keys(jobs)

  return jobs[ids[ids.length - 1]]
}

Job.find = (storage, jobId) => {
  return storage.get('jobs', jobId)
}

Job.fromJson = (storage, json) => {
  json.storage = storage

  return Object.assign(new Job(), json)
}

module.exports = Job
