const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const logger = require('../lib/logger')

class StopCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StopCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => {
          logger.infoWithTime('Loading stacks')

          return loadStacks(ctx, flags, args)
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Stopping stacks')

          ctx.stacks.forEach(stack => {
            const containerName = dockerUtils.containerName(ctx.config.id, stack.name)
            const localdir = process.cwd()
            const workdir = ctx.config.findInDockerfileData(stack.name, 'working_dir')

            if (dockerUtils.isContainerRunning(containerName)) {
              dockerUtils.stopContainer(localdir, workdir, containerName)

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

StopCommand.description = `Stop containers locally.`

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

module.exports = StopCommand
