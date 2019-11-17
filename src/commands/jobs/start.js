const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {buildConfig, loadStacks} = require('../../lib/task-actions')
const runTask = require('../../lib/run-task')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')

class StartCommand extends BaseCommand {
  async run() {
    const {argv, flags} = this.parse(StartCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, argv)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => this.processCommand(ctx, argv, stack, flags['stack-path']))
        }
      }
    ]

    await runTask(tasks)
  }

  processCommand(ctx, argv, stack, stackDir) {
    const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

    if (this.docker.isContainerRunning(containerName)) {
      const command = (argv.length === 0) ? '' : argv.join(' ')
      const workdir = (stackDir) ? stackDir : stack.containerDir

      if (command === '') {
        throw new PenguinError(errorMessages.SPECIFY_COMMAND)
      } else {
        const job = new Job(ctx.config.projectId, stack.name, command, true, this.storage)

        logger.info(`Starting job ${job.id} with "${command}" in ${containerName}:${workdir}`)

        this.docker.startJob(containerName, workdir, job.start())
      }
    } else {
      throw new PenguinError(errorMessages.stackNotRunningError(stack.name))
    }
  }
}

StartCommand.description = `Start an asynchronous job inside of a stack.`

StartCommand.usage = `$ [ARGS...]`

StartCommand.strict = false

StartCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'stack-path': flags.string({
    description: `Specify an absolute path inside the container that you'd like your job to be executed in.`
  })
}

StartCommand.hidden = false

module.exports = StartCommand
