const BaseCommand = require('../base')
const {buildConfig, loadAllStacks} = require('../../lib/task-actions')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const paths = require('../../lib/paths')

class StatusCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => loadAllStacks(ctx)
      },
      {
        action: ctx => {
          const data = []

          ctx.project.stacks.map(stack => {
            const containerName = this.docker.containerName(ctx.project.id, stack.name)

            data.push({
              stackName: stack.name,
              mountedHostDir: paths.relativePath(stack.hostPath).join('/'),
              containerName: containerName,
              containerStatus: this.docker.containerStatus(containerName)
            })
          })

          logger.table({
            stackName: { header: 'Stack' },
            mountedHostDir: { header: 'Host Path' },
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
