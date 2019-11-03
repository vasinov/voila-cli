const {Command, flags} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')

class LocalRunCommand extends Command {
  async run() {
    const {argv, flags} = this.parse(LocalRunCommand)

    const tasks = [
      {
        title: 'Loading config',
        silent: true,
        action: ctx => {
          ctx.config = loadConfig()
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
          if (ctx.config.containers.length === 0) {
            throw new VoilaError(errorMessages.DEFINE_CONTAINERS)
          } else if (flags['container-name']) {
            this.runCommand(ctx, argv, flags['container-name'], flags['detach-command'])
          } else if (ctx.config.containers.length === 1) {
            this.runCommand(ctx, argv, ctx.config.containers[0].name, flags['detach-command'])
          } else {
            throw new VoilaError(errorMessages.SPECIFY_CONTAINER_NAME)
          }
        }
      }
    ]

    await runTask(tasks, this)
  }

  runCommand(ctx, argv, name, async) {
    const containerName = dockerUtils.containerName(ctx.config.id, name)

    if (dockerUtils.isContainerRunning(containerName)) {
      const commandFromConfig = ctx.config.getValue(name, 'cmd')
      const command =
        (argv.length === 0 && !commandFromConfig) ?
          '' : (argv.length === 0) ? commandFromConfig : argv.join(' ')

      if (command === '') {
        throw new VoilaError(errorMessages.SPECIFY_COMMAND)
      } else if (async) {
        dockerUtils.runCommandAsync(containerName, command)
      } else {
        const subProcess = dockerUtils.runCommand(containerName, command)

        subProcess.on('exit', code => {
          if (code !== 0) this.log(errorMessages.EXEC_INTERRUPTED)
        })

        subProcess.on('error', code => {
          this.log(errorMessages.containerError(containerName, code, command))
        })
      }
    } else {
      throw new VoilaError(errorMessages.START_CONTAINER_LOCAL)
    }
  }
}

LocalRunCommand.aliases = ['local:run']

LocalRunCommand.description = `Run a shell command inside of a running container.`

LocalRunCommand.usage = `local-run [ARGS...]`

LocalRunCommand.strict = false

LocalRunCommand.flags = {
  'container-name': flags.string({
    description: `Specify container name.`
  }),
  'detach-command': flags.boolean({
    description: `Run command asynchronously.`,
    default: false
  })
}

module.exports = LocalRunCommand
