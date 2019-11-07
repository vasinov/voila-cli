const {Command, flags} = require('@oclif/command')
const chalk = require('chalk')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const {relativeModuleDir, isCurrentPathInModuleDir, moduleHostDir} = require('../lib/directories')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')

class $Command extends Command {
  async run() {
    const cmd = this
    const {argv, flags} = this.parse($Command)

    const tasks = [
      {
        title: 'Loading config',
        silent: true,
        action: ctx => {
          const [message, config] = loadConfig()

          ctx.config = config

          if (message) cmd.warn(message)
        }
      },
      {
        title: 'Parsing and validating config',
        silent: true,
        action: ctx => {
          ctx.config = new ConfigManager(ctx.config)
        }
      },
      {
        title: 'Executing commands',
        silent: true,
        action: ctx => {
          const containerName = flags['container-name']
          const shouldDetach = flags['detach-command']
          const executeIn = flags['execute-in']

          if (ctx.config.containers.length === 0) {
            throw new VoilaError(errorMessages.DEFINE_CONTAINERS)
          } else if (containerName) {
            this.processCommand(ctx, argv, containerName, shouldDetach, executeIn)
          } else if (ctx.config.containers.length === 1) {
            this.processCommand(ctx, argv, ctx.config.containers[0].name, shouldDetach, executeIn)
          } else {
            throw new VoilaError(errorMessages.SPECIFY_CONTAINER_NAME)
          }
        }
      }
    ]

    await runTask(tasks, this)
  }

  processCommand(ctx, argv, moduleName, shouldDetach, executeIn) {
    const containerName = dockerUtils.containerName(ctx.config.id, moduleName)

    if (dockerUtils.isContainerRunning(containerName)) {
      const module = ctx.config.getModule(moduleName)
      const commandFromConfig = ctx.config.findInDockerfileData(moduleName, 'cmd')

      const command = (argv.length === 0 && !commandFromConfig) ?
        '' :
        (argv.length === 0) ? commandFromConfig : argv.join(' ')

      if (isCurrentPathInModuleDir(module)) {
        const workdir = (executeIn) ? executeIn : relativeModuleDir(module)

        if (command === '') {
          throw new VoilaError(errorMessages.SPECIFY_COMMAND)
        } else if (shouldDetach) {
          this.announceCommand(moduleName, workdir, command, true)

          dockerUtils.runCommandAsync(containerName, workdir, command)
        } else {
          this.announceCommand(moduleName, workdir, command, false)

          const subProcess = dockerUtils.runCommand(containerName, workdir, command)

          subProcess.on('exit', code => {
            if (code === 1) this.log(errorMessages.EXEC_INTERRUPTED)
          })

          subProcess.on('error', code => {
            this.log(errorMessages.containerError(containerName, code, command))
          })
        }
      } else {
        throw new VoilaError(errorMessages.wrongModuleHostDirError(moduleHostDir(module)))
      }
    } else {
      throw new VoilaError(errorMessages.NO_RUNNING_CONTAINER)
    }
  }

  announceCommand(moduleName, workdir, command, isAsync) {
    if (isAsync) {
      this.log(chalk.dim(`Asynchronously executing "${command}" in ${moduleName}:${workdir}`))
    } else {
      this.log(chalk.dim(`Executing "${command}" in ${moduleName}:${workdir}`))
    }
  }
}

$Command.description = `Run a shell command inside of a running container.`

$Command.usage = `$ [ARGS...]`

$Command.strict = false

$Command.flags = {
  'container-name': flags.string({
    description: `Specify container name.`
  }),
  'execute-in': flags.string({
    description: `Specify a directory inside the container that you'd like your command to be executed in.`
  }),
  'detach-command': flags.boolean({
    description: `Run command asynchronously.`,
    default: false
  })
}

module.exports = $Command
