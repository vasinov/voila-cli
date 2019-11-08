const {Command} = require('@oclif/command')

const {loadConfig, parseConfig} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const logger = require('../lib/logger')

class StatusCommand extends Command {
  async run() {
    const cmd = this

    const tasks = [
      {
        action: ctx => loadConfig(ctx, false)
      },
      {
        action: ctx => parseConfig(ctx, false)
      },
      {
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

          logger.table({
            moduleName: { header: 'Module Name' },
            containerName: { header: 'Container Name' },
            status: {}
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

StatusCommand.description = `Status of modules and containers.`

module.exports = StatusCommand
