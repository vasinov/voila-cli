const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')
const {buildConfig} = require('../../lib/task-actions')

class KillCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(KillCommand)

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

            if (this.docker.isContainerRunning(containerName)) {
              if (this.docker.isJobRunning(job)) {
                logger.info(`Killing job ${jobJson.id}`)

                this.docker.killJob(containerName, job.kill(), flags['signal'])
              } else {
                throw new PenguinError(errorMessages.JOB_ISNT_RUNNING)
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

KillCommand.description = `Kill a running job. If no ID is provided the last started job will be killed.`

KillCommand.args = [
  {
    name: 'job-id',
    required: false
  }
]

KillCommand.flags = {
  'signal': flags.string({
    default: 'KILL',
    description: `Signal for the kill command. Can be either a name or a number.`
  })
}

KillCommand.hidden = false

module.exports = KillCommand
