const {Command} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../../lib/task-actions')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')

class PathCommand extends Command {
  async run() {
    const {flags, args} = this.parse(PathCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, args, true)
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

module.exports = PathCommand
