const {Command} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')

class StopCommand extends Command {
  async run() {
    const cmd = this

    const tasks = [
      {
        title: 'Loading config',
        action: ctx => {
          const [message, config] = loadConfig()

          ctx.config = config

          if (message) cmd.warn(message)
        }
      },
      {
        title: 'Parsing and validating config',
        action: ctx => {
          ctx.config = new ConfigManager(ctx.config)
        }
      },
      {
        title: 'Stopping modules',
        action: ctx => {
          return ctx.config.modules.map((c) => {
            const containerName = dockerUtils.containerName(ctx.config.id, c.name)
            const localdir = process.cwd()
            const workdir = ctx.config.findInDockerfileData(c.name, 'working_dir')

            if (dockerUtils.isContainerRunning(containerName)) {
              dockerUtils.stopContainer(localdir, workdir, containerName)

              return `Stopped container ${containerName}`
            } else {
              return `Container ${containerName} was not running`
            }
          })
        }
      }
    ]

    await runTask(tasks)
  }
}

StopCommand.description = `Stop containers locally.`

module.exports = StopCommand
