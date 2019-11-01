const {Command} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const loadConfig = require('../lib/config/loader').loadConfig
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')

class LocalStopCommand extends Command {
  async run() {
    const cmd = this

    const tasks = [
      {
        title: 'Loading config',
        action: ctx => {
          ctx.config = loadConfig()
        }
      },
      {
        title: 'Parsing and validating config',
        action: ctx => {
          ctx.config = new ConfigManager(ctx.config)
        }
      },
      {
        title: 'Stopping containers',
        action: ctx => {
          return ctx.config.containers.map((c) => {
            const containerName = dockerUtils.containerName(ctx.config.id, c.name)
            const localdir = process.cwd()
            const workdir = ctx.config.getValue(c.name, 'working_dir')

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

    await runTask(tasks, cmd)
  }
}

LocalStopCommand.aliases = ['local:stop']

LocalStopCommand.description = `Stop containers locally.`

module.exports = LocalStopCommand
