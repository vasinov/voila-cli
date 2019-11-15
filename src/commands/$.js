const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {relativeStackPath, stackHostPath, doesCurrentPathContainPath} = require('../lib/paths')
const runTask = require('../lib/run-task')
const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class $Command extends BaseCommand {
  async run() {
    const {argv, flags} = this.parse($Command)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, argv)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => {
            this.processCommand(ctx, argv, stack, flags['run-as-job'], flags['stack-path'])
          })
        }
      }
    ]

    await runTask(tasks)
  }

  processCommand(ctx, argv, stack, shouldDetach, executeIn) {
    const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

    if (this.docker.isContainerRunning(containerName)) {
      const command = (argv.length === 0) ? '' : argv.join(' ')

      if (executeIn || doesCurrentPathContainPath(stackHostPath(stack))) {
        const workdir = (executeIn) ? executeIn : relativeStackPath(stack).join('/')

        if (command === '') {
          throw new PenguinError(errorMessages.SPECIFY_COMMAND)
        } else if (shouldDetach) {
          logger.dimInfo(`Asynchronously executing "${command}" in ${containerName}:${workdir}`)

          this.docker.execCommandAsync(containerName, workdir, command)
        } else {
          logger.dimInfo(`Executing "${command}" in ${containerName}:${workdir}`)

          this.docker.execCommandSync(containerName, workdir, command)
        }
      } else {
        throw new PenguinError(errorMessages.wrongStackHostDirError(stackHostPath(stack).join('/')))
      }
    } else {
      throw new PenguinError(errorMessages.stackNotRunningError(stack.name))
    }
  }
}

$Command.description = `Run a shell command inside of a running stack.`

$Command.usage = `$ [ARGS...]`

$Command.strict = false

$Command.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'stack-path': flags.string({
    description: `Specify an absolute path inside the container that you'd like your command to be executed in.`
  }),
  'run-as-job': flags.boolean({
    description: `Run command asynchronously.`,
    default: false
  })
}

module.exports = $Command
