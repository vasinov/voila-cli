const BaseCommand = require('../base')
const {buildConfig, loadAllStacks} = require('../../lib/task-actions')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')

class StatusCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadAllStacks(ctx)
      },
      {
        action: ctx => {
          const data = []

          ctx.config.projectStacks.map(stack => {
            const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

            data.push({
              stackName: stack.name,
              mountedHostDir: stack.hostDir,
              containerName: containerName,
              containerStatus: this.docker.containerStatus(containerName)
            })
          })

          logger.table({
            stackName: { header: 'Stack' },
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

StatusCommand.description = `List all project stacks and their status details.`

StatusCommand.hidden = false

module.exports = StatusCommand
