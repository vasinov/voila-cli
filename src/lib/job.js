const crypto = require('crypto')

class Job {
  constructor(command, savingOutput, storage) {
    this.id = crypto.randomBytes(6).toString('hex')
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
      command: this.command,
      savingOutput: this.savingOutput,
      queuedAt: this.queuedAt,
      startedAt: this.startedAt
    }
  }
}

Job.containerOutputPath = '/penguin/jobs/output'

module.exports = Job
