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
  }

  start = () => {
    this.startedAt = Date.now()

    this.storage.set('jobs', this.id, this.toJson())

    return this
  }

  toJson = () => {
    return {
      id: this.id,
      projectId: this.projectId,
      stackName: this.stackName,
      command: this.command,
      savingOutput: this.savingOutput,
      queuedAt: this.queuedAt,
      startedAt: this.startedAt
    }
  }
}

Job.containerOutputPath = '/penguin/jobs/output'

Job.list = storage => {
  return storage.list('jobs')
}

Job.last = storage => {
  const jobs = storage.list('jobs')
  const ids = Object.keys(storage.list('jobs'))

  return jobs[ids[ids.length - 1]]
}

Job.find = (storage, jobId) => {
  return storage.get('jobs', jobId)
}

module.exports = Job
