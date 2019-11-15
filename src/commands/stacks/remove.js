const fs = require('fs')

const BaseCommand = require('../base')
const {buildConfig, loadStacks} = require('../../lib/task-actions')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')

class RemoveCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(RemoveCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, args, true)
      },
      {
        action: async ctx => {
          ctx.stacks.forEach(stack => this.removeStack(ctx, stack))
        }
      }
    ]

    await runTask(tasks)
  }

  removeStack(ctx, stack) {
    if (this.docker.isContainerRunning(this.docker.containerName(ctx.config.projectId, stack.name))) {
      throw new PenguinError(errorMessages.stopStackBeforeProceeding(stack.name))
    } else {
      fs.unlinkSync(stack.configFile)
      logger.info(`Stack "${stack.name}" removed`)
    }
  }
}

RemoveCommand.description = `Removes a stack.`

RemoveCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Remove a specific stack.'
  }
]

module.exports = RemoveCommand
