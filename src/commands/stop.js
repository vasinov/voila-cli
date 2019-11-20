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
        action: ctx => loadStacks(ctx, this.docker, flags, args, true)
      },
      {
        action: ctx => {
          logger.infoWithTime('Stopping stacks')

          ctx.stacks.forEach(stack => {
            const containerName = this.docker.containerName(ctx.project.id, stack.name)
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

StopCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'all': flags.boolean({
    description: `Stop all stacks in the project.`,
    default: false
  })
}

StopCommand.hidden = false

module.exports = StopCommand
