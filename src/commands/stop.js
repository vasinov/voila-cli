const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {runTask} = require('../lib/task-runner')
const logger = require('../lib/logger')

class StopCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StopCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => {
          logger.infoWithTime('Loading stacks')

          return loadStacks(ctx, this.docker, flags, args)
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Stopping stacks')

          ctx.stacks.forEach(stack => {
            const containerName = this.docker.containerName(ctx.config.projectId, stack.name)
            const localdir = process.cwd()

            if (this.docker.isContainerRunning(containerName)) {
              this.docker.stopContainer(localdir, containerName)

              logger.infoWithTime(`Stack "${stack.name}" stopped`, true)
            } else {
              logger.infoWithTime(`Stack "${stack.name}" was not running`, true)
            }
          })
        }
      }
    ]

    await runTask(tasks)
  }
}

StopCommand.description = `Stop running stacks.`

StopCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Stack name to stop.'
  }
]

StopCommand.flags = {
  'all': flags.boolean({
    description: `Stop all stacks in the project.`,
    default: false
  })
}

StopCommand.hidden = false

module.exports = StopCommand
