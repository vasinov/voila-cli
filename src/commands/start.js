const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
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
            const imageName = dockerUtils.imageName(ctx.config.id, stack.name)
            const dockerfile = ctx.config.toDockerfile(stack.name)

            dockerUtils.buildImage(imageName, dockerfile, flags['no-cache'], flags['pull'])

            logger.infoWithTime(`Image for ${stack.name} built`, true)
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
    const imageName = dockerUtils.imageName(ctx.config.id, stack.name)
    const containerName = dockerUtils.containerName(ctx.config.id, stack.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      logger.infoWithTime(`Stack "${stack.name}" is already running`, true)
    } else if (stack.shouldStartAttached()) {
      logger.infoWithTime(`Stack "${stack.name}" running`, true)

      dockerUtils.startContainer(
        stack.volumes, stack.ports, containerName, imageName, true, flags['persist'])

      logger.infoWithTime(`Stack "${stack.name}" stopped`, true)
    } else {
      const result = dockerUtils.startContainer(
        stack.volumes, stack.ports, containerName, imageName, false, flags['persist'])

      if (result.stderr.length > 0) {
        throw new VoilaError(result.stderr)
      } else {
        logger.infoWithTime(`Stack "${stack.name}" started`, true)
      }
    }
  }
}

StartCommand.description = `Start stack containers.`

StartCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Stack name to start.'
  }
]

StartCommand.flags = {
  'all': flags.boolean({
    description: `Start all stacks in the project.`,
    default: false
  }),
  'no-cache': flags.boolean({
    description: `Don't use cache when building stack images.`,
    default: false
  }),
  'pull': flags.boolean({
    description: `Always attempt to pull newer versions of Docker images.`,
    default: false
  }),
  'persist': flags.boolean({
    description: `Don't remove the container when it exits.`,
    default: false
  })
}

module.exports = StartCommand
