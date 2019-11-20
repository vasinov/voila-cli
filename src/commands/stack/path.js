const {flags} = require('@oclif/command')

const BaseCommand = require('../base')
const {buildConfig, loadStacks} = require('../../lib/task-actions')
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
        action: ctx => loadStacks(ctx, this.docker, flags, args)
      },
      {
        action: ctx => {
          ctx.stacks.forEach(stack => {
            logger.info(stack.hostPath)
          })
        }
      }
    ]

    await runTask(tasks)
  }
}

PathCommand.description = `Returns stack's mounted path.`

PathCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  })
}

PathCommand.hidden = false

module.exports = PathCommand
