const {Command} = require('@oclif/command')
const {cli} = require('cli-ux')

const ConfigManager = require('../lib/config/manager')
const loadConfig = require('../lib/config/loader').loadConfig
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')

class LocalStatusCommand extends Command {
  async run() {
    const cmd = this

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
        title: 'Loading status',
        silent: true,
        action: ctx => {
          const data = []

          ctx.config.containers.map((c) => {
            const containerName = dockerUtils.containerName(ctx.config.id, c.name)

            data.push({
              name: containerName,
              status: dockerUtils.containerStatus(containerName)
            })
          })

          cli.table(data, {
            name: { header: 'Container Name' },
            status: {}
          })
        }
      }
    ]

    await runTask(tasks, cmd)
  }
}

LocalStatusCommand.aliases = ['local:status']

LocalStatusCommand.description = `Local status of containers and jobs.`

module.exports = LocalStatusCommand
