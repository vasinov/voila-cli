const {Command} = require('@oclif/command')

const {loadConfig, loadModules} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const logger = require('../lib/logger')

class StatusCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => loadConfig(ctx, false)
      },
      {
        action: ctx => loadModules(ctx, flags, args, true, false)
      },
      {
        action: ctx => {
          const data = []

          ctx.config.allModules.map(module => {
            const containerName = dockerUtils.containerName(ctx.config.id, module.name)

            data.push({
              moduleName: module.name,
              mountedHostDir: module.hostDir,
              containerName: containerName,
              containerStatus: dockerUtils.containerStatus(containerName)
            })
          })

          logger.table({
            moduleName: { header: 'Module' },
            mountedHostDir: { header: 'Mounted Directory' },
            containerName: { header: 'Image Name' },
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
