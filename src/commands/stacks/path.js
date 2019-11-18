const BaseCommand = require('../base')
const {buildConfig, promptAllStacks} = require('../../lib/task-actions')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')

class PathCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(PathCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => promptAllStacks(ctx, this.docker)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => {
            logger.info(stack.hostDir)
          })
        }
      }
    ]

    await runTask(tasks)
  }
}

PathCommand.description = `Returns stack's mounted path.`

PathCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Return a mounted path for a specific stack.'
  }
]

PathCommand.hidden = false

module.exports = PathCommand
