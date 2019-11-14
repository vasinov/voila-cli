const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/task-actions')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const logger = require('../lib/logger')

class StartCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StartCommand)

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
          logger.infoWithTime('Downloading dependencies and building images')

          ctx.stacks.forEach(stack => {
            const imageName = dockerUtils.imageName(ctx.config.projectId, stack.name)

            logger.infoWithTime(`Building image for the "${stack.name}" stack`, true)

            dockerUtils.buildImage(imageName, stack.dockerfile, flags['no-cache'], flags['pull'], flags['verbose'])

            logger.infoWithTime(`Image for the "${stack.name}" stack finished building`, true)
          })
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Starting stacks')

          ctx.stacks.forEach((stack) => StartCommand.initStack(ctx, stack, flags))
        }
      }
    ]

    await runTask(tasks)
  }

  static initStack(ctx, stack, flags) {
    const imageName = dockerUtils.imageName(ctx.config.projectId, stack.name)
    const containerName = dockerUtils.containerName(ctx.config.projectId, stack.name)
    const command = stack.entrypointCommand

    if (dockerUtils.isContainerRunning(containerName)) {
      logger.infoWithTime(`Stack "${stack.name}" is already running`, true)
    } else if (command) {
      logger.infoWithTime(`Executing "${command}" in stack "${stack.name}"`, true)

      dockerUtils.startContainer(stack, containerName, imageName, flags['persist'], command)

      logger.infoWithTime(`Stack "${stack.name}" stopped`, true)
    } else {
      dockerUtils.startContainer(stack, containerName, imageName, flags['persist'])

      logger.infoWithTime(`Stack "${stack.name}" started`, true)
    }
  }
}

StartCommand.description = `Start stacks.`

StartCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Stack name to start.'
  }
]

StartCommand.flags = {
  'all': flags.boolean({
    description: `Start all stacks in the project.`
  }),
  'no-cache': flags.boolean({
    description: `Don't use cache when building stack images.`
  }),
  'pull': flags.boolean({
    description: `Always attempt to pull newer versions of Docker images.`
  }),
  'persist': flags.boolean({
    description: `Don't remove the container when it stops.`
  }),
  'verbose': flags.boolean({
    description: `Show all output.`
  })
}

module.exports = StartCommand
