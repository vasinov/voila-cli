const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {buildConfig, loadStacks} = require('../../lib/task-actions')
const {runTask} = require('../../lib/task-runner')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')

class StartCommand extends BaseCommand {
  async run() {
    const {argv, flags} = this.parse(StartCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => loadStacks(ctx, this.docker, flags, argv, true)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => this.processCommand(ctx, flags, argv, stack, flags['stack-path']))
        }
      }
    ]

    await runTask(tasks)
  }

  processCommand(ctx, flags, argv, stack, stackPath) {
    const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

    if (this.docker.isContainerRunning(containerName)) {
      const command = (argv.length === 0) ? '' : argv.join(' ')
      const workdir = (stackPath) ? stackPath : stack.stackPath

      if (command === '') {
        throw new PenguinError(errorMessages.SPECIFY_COMMAND)
      } else {
        const job = new Job(ctx.config.projectId, stack.name, command, true, this.storage)

        if (flags['save-output']) {
          logger.info(`Starting job ${job.id} with "${command}" in ${containerName}:${workdir}\nCommand output is being saved. Log it with "penguin job:log ${job.id}"`)
        } else {
          logger.info(`Starting job ${job.id} with "${command}" in ${containerName}:${workdir}\nCommand output is not being saved.`)
        }

        this.docker.startJob(containerName, workdir, job.start(), flags['save-output'])
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
  }),
  'save-output': flags.boolean({
    description: `Save command output in the container. The "job:log" command requires this option to be enabled.`
  })
}

StartCommand.hidden = false

module.exports = StartCommand
