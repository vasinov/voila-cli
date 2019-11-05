const {Command, flags} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')

class SshCommand extends Command {
  async run() {
    const cmd = this
    const {flags} = this.parse(SshCommand)

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
        title: 'Connecting over SSH',
        action: async ctx => {
         if (ctx.config.containers.length === 0) {
           throw new VoilaError(errorMessages.DEFINE_CONTAINERS)
         } else if (flags['container-name']) {
           this.sshContainer(
             dockerUtils.containerName(ctx.config.id, flags['container-name'])
           )
         } else if (ctx.config.containers.length === 1) {
           this.sshContainer(
             dockerUtils.containerName(ctx.config.id, ctx.config.containers[0].name)
           )
         } else {
           throw new VoilaError(errorMessages.SPECIFY_CONTAINER_NAME)
         }
        }
      }
    ]

    await runTask(tasks, this)
  }

  sshContainer(containerName) {
    if (dockerUtils.isContainerRunning(containerName)) {
      const subProcess = dockerUtils.sshContainer(containerName)

      subProcess.on('exit', code => {
        if (code !== 0) this.log(errorMessages.SSH_SESSION_INTERRUPTED)
      })

      subProcess.on('error', code => {
        this.log(errorMessages.containerError(containerName, code, 'SSH session'))
      })
    } else {
      throw new VoilaError(errorMessages.NO_RUNNING_CONTAINER)
    }
  }
}

SshCommand.description = `Connect to a container over SSH.`

SshCommand.flags = {
  'container-name': flags.string({
    description: `Specify container name.`
  })
}

module.exports = SshCommand
