const {Command, flags} = require('@oclif/command')

const {loadConfig, loadStacks} = require('../lib/tasks')
const {relativeStackPath, stackHostPath, doesCurrentPathContainPath} = require('../lib/paths')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class $Command extends Command {
  async run() {
    const {argv, flags} = this.parse($Command)

    const tasks = [
      {
        action: ctx => loadConfig(ctx, false)
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
    const containerName = dockerUtils.containerName(ctx.config.id, stack.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      const commandFromConfig = ctx.config.findInDockerfileData(stack.name, 'cmd')

      const command = (argv.length === 0 && !commandFromConfig) ?
        '' :
        (argv.length === 0) ? commandFromConfig : argv.join(' ')

      if (executeIn || doesCurrentPathContainPath(stackHostPath(stack))) {
        const workdir = (executeIn) ? executeIn : relativeStackPath(stack).join('/')

        if (command === '') {
          throw new VoilaError(errorMessages.SPECIFY_COMMAND)
        } else if (shouldDetach) {
          $Command.log(stack.name, workdir, command, true)

          dockerUtils.runCommandAsync(containerName, workdir, command)
        } else {
          $Command.log(stack.name, workdir, command, false)

          const subProcess = dockerUtils.runCommand(containerName, workdir, command)

          subProcess.on('exit', code => {
            if (code === 1) logger.error(errorMessages.EXEC_INTERRUPTED)
          })

          subProcess.on('error', code => {
            logger.error(errorMessages.containerError(containerName, code, command))
          })
        }
      } else {
        throw new VoilaError(errorMessages.wrongStackHostDirError(stackHostPath(stack).join('/')))
      }
    } else {
      throw new VoilaError(errorMessages.stackNotRunningError(stack.name))
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
