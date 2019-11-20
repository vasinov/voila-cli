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
            Job.last(this.storage, ctx.project.id)

          if (jobJson) {
            const job = Job.fromJson(this.storage, jobJson)
            const containerName = this.docker.containerName(job.id, job.stackName)

            if (this.docker.isContainerRunning(containerName)) {
              if (this.docker.doesJobOutputExist(job)) {
                if (flags['full'] || !this.docker.isJobRunning(job)) {
                  logger.info(this.docker.cat(containerName, Job.outputFileName(job.id)))
                } else {
                  this.docker.tail(containerName, Job.outputFileName(job.id))
                }
              } else {
                throw new PenguinError(errorMessages.jobDoesntExistAfterRestart(job))
              }
            } else {
              throw new PenguinError(errorMessages.stackNotRunningError(job.stackName))
            }
          } else {
            throw new PenguinError(errorMessages.JOB_DOESNT_EXIST)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

LogCommand.description = `Continually outputs the log of the current command. Equivalent to "tail -f".`

LogCommand.args = [
  {
    name: 'job-id',
    required: false
  }
]

LogCommand.flags = {
  'full': flags.boolean({
    description: `Show the full log of the command. This flag prevents tailing and returns immediately.`
  })
}

LogCommand.hidden = false

module.exports = LogCommand
