const {Command} = require('@oclif/command')
const fs = require('fs')

const {buildConfig, loadStacks} = require('../../lib/tasks')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const {containerName, isContainerRunning} = require('../../lib/docker-utils')
const VoilaError = require('../../lib/error/voila-error')
const errorMessages = require('../../lib/error/messages')

class RemoveCommand extends Command {
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
          ctx.stacks.forEach(stack => RemoveCommand.removeStack(ctx, stack))
        }
      }
    ]

    await runTask(tasks)
  }

  static removeStack(ctx, stack) {
    if (isContainerRunning(containerName(ctx.config.projectId, stack.name))) {
      throw new VoilaError(errorMessages.stopStackBeforeProceeding(stack.name))
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
