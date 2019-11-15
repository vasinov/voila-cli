const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/task-actions')
const {relativeStackPath, stackHostPath, doesCurrentPathContainPath} = require('../lib/paths')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class $Command extends Command {
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
            $Command.processCommand(ctx, argv, stack, flags['run-as-job'], flags['stack-path'])
          })
        }
      }
    ]

    await runTask(tasks)
  }

  static processCommand(ctx, argv, stack, shouldDetach, executeIn) {
    const containerName = dockerUtils.containerName(ctx.config.projectId, stack.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      const command = (argv.length === 0) ? '' : argv.join(' ')

      if (executeIn || doesCurrentPathContainPath(stackHostPath(stack))) {
        const workdir = (executeIn) ? executeIn : relativeStackPath(stack).join('/')

        if (command === '') {
          throw new PenguinError(errorMessages.SPECIFY_COMMAND)
        } else if (shouldDetach) {
          $Command.log(stack.name, workdir, command, true)

          dockerUtils.execCommandAsync(containerName, workdir, command)
        } else {
          $Command.log(stack.name, workdir, command, false)

          dockerUtils.execCommandSync(containerName, workdir, command)
        }
      } else {
        throw new PenguinError(errorMessages.wrongStackHostDirError(stackHostPath(stack).join('/')))
      }
    } else {
      throw new PenguinError(errorMessages.stackNotRunningError(stack.name))
    }
  }

  static log(stackName, workdir, command, isAsync) {
    if (isAsync) {
      logger.dimInfo(`Asynchronously executing "${command}" in ${stackName}:${workdir}`)
    } else {
      logger.dimInfo(`Executing "${command}" in ${stackName}:${workdir}`)
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
