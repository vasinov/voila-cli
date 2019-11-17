const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')

class OutputCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(OutputCommand)

    const tasks = [
      {
        action: ctx => {
          const jobJson = args['job-id'] ?
            Job.find(this.storage,  args['job-id']) :
            Job.last(this.storage)

          if (jobJson) {
            const job = Job.fromJson(this.storage, jobJson)
            const containerName = this.docker.containerName(job.projectId, job.stackName)

            logger.info(this.docker.cat(containerName, job.outputFileName()))
          } else {
            throw new PenguinError(errorMessages.JOB_DOESNT_EXIST)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

OutputCommand.description = `Return full job output. If the job is still running this command will return the output generated up until now.`

OutputCommand.args = [
  {
    name: 'job-id',
    required: false
  }
]

OutputCommand.hidden = false

module.exports = OutputCommand
