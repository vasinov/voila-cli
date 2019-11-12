const {Command} = require('@oclif/command')

const {loadConfig, loadStacks} = require('../../lib/tasks')
const runTask = require('../../lib/run-task')
const dockerUtils = require('../../lib/docker-utils')
const logger = require('../../lib/logger')

class StatusCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => loadConfig(ctx, false)
      },
      {
        action: ctx => {
          flags['all'] = true

          return loadStacks(ctx, flags, args)
        }
      },
      {
        action: ctx => {
          const data = []

          ctx.config.allStacks.map(stack => {
            const containerName = dockerUtils.containerName(ctx.config.id, stack.name)

            data.push({
              stackName: stack.name,
              mountedHostDir: stack.hostDir,
              containerName: containerName,
              containerStatus: dockerUtils.containerStatus(containerName)
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

module.exports = StatusCommand
