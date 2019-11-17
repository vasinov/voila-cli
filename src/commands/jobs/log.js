const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')
const {buildConfig} = require('../../lib/task-actions')

class LogCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(LogCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => {
          const jobJson = args['job-id'] ?
            Job.find(this.storage,  args['job-id']) :
            Job.last(this.storage, ctx.config.projectId)

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

LogCommand.description = `Continually outputs the log of the current command.`

LogCommand.args = [
  {
    name: 'job-id',
    required: false
  }
]

LogCommand.hidden = false

module.exports = LogCommand
