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

          ctx.config.modules.map((module) => {
            const containerName = dockerUtils.containerName(ctx.config.id, module.name)

            data.push({
              moduleName: module.name,
              mountedHostDir: module.hostDir,
              containerName: containerName,
              containerStatus: dockerUtils.containerStatus(containerName)
            })
          })

          logger.table({
            moduleName: { header: 'Module Name' },
            mountedHostDir: { header: 'Mounted Directory' },
            containerName: { header: 'Docker Container Name' },
            containerStatus: { header: 'Status' }
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

StatusCommand.description = `Status of modules and containers.`

module.exports = StatusCommand
