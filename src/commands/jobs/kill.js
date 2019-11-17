const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')
const {buildConfig, loadStacks} = require('../../lib/task-actions')

class KillCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(KillCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, args)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => this.killJob(ctx, args, flags, stack))
        }
      }
    ]

    await runTask(tasks)
  }

  killJob(ctx, args, flags, stack) {
    const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

    const job = args['job-id'] ?
      Job.find(this.storage,  args['job-id']) :
      Job.last(this.storage)

    if (job) {
      if (this.docker.isJobRunning(containerName, job.id)) {
        logger.info(`Killing job ${job.id}`)

        this.docker.killJob(containerName, job.id, flags['signal'])
      } else {
        throw new PenguinError(errorMessages.JOB_ISNT_RUNNING)
      }
    } else {
      throw new PenguinError(errorMessages.JOB_DOESNT_EXIST)
    }
  }
}

KillCommand.description = `Kill a running job. If no ID is provided the last started job will be killed.`

KillCommand.args = [
  {
    name: 'job-id',
    required: false,
    description: 'ID of the job to kill.'
  }
]

KillCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'signal': flags.string({
    default: 'KILL',
    description: `Signal for the kill command. Can be either a name or a number.`
  })
}

KillCommand.hidden = false

module.exports = KillCommand
