const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {hostToStackAbsolutePath, relativeStackHostPath, doesCurrentPathContain} = require('../lib/paths')
const {runTask} = require('../lib/task-runner')
const CliError = require('../lib/error/cli-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class $Command extends BaseCommand {
  async run() {
    const {argv, flags} = this.parse($Command)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => loadStacks(ctx, this.docker, flags, argv, true)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => {
            this.processCommand(ctx, argv, stack, flags['stack-path'])
          })
        }
      }
    ]

    await runTask(tasks)
  }

  processCommand(ctx, argv, stack, stackDir) {
    const containerName = this.docker.containerName(ctx.project.id, stack.name)

    if (this.docker.isContainerRunning(containerName)) {
      const command = (argv.length === 0) ? '' : argv.join(' ')

      if (stackDir || doesCurrentPathContain(relativeStackHostPath(stack))) {
        const workdir = (stackDir) ? stackDir : hostToStackAbsolutePath(stack).join('/')

        if (command === '') {
          throw new CliError(errorMessages.SPECIFY_COMMAND)
        } else {
          logger.dimInfo(`Executing "${command}" in ${containerName}:${workdir}`)

          this.docker.execCommandSync(containerName, workdir, command)
        }
      } else {
        throw new CliError(errorMessages.wrongStackHostDirError(relativeStackHostPath(stack).join('/')))
      }
    } else {
      throw new CliError(errorMessages.stackNotRunningError(stack.name))
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
  })
}

$Command.hidden = false

module.exports = $Command
