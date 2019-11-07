const {Command} = require('@oclif/command')
const {cli} = require('cli-ux')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')

class StatusCommand extends Command {
  async run() {
    const cmd = this

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
        title: 'Loading status',
        silent: true,
        action: ctx => {
          const data = []

          ctx.config.modules.map((c) => {
            const containerName = dockerUtils.containerName(ctx.config.id, c.name)

            data.push({
              moduleName: c.name,
              containerName: containerName,
              status: dockerUtils.containerStatus(containerName)
            })
          })

          cli.table(data, {
            moduleName: { header: 'Module Name' },
            containerName: { header: 'Container Name' },
            status: {}
          })
        }
      }
    ]

    await runTask(tasks, cmd)
  }
}

StatusCommand.description = `Status of modules and containers.`

module.exports = StatusCommand
