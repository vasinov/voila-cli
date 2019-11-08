const {Command, flags} = require('@oclif/command')

const {loadConfig, parseConfig, executeModuleAction} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const logger = require('../lib/logger')

class StartCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StartCommand)

    const tasks = [
      {
        action: ctx => loadConfig(ctx)
      },
      {
        action: ctx => parseConfig(ctx)
      },
      {
        action: ctx => {
          logger.infoWithTime('Downloading dependencies and building images')

          executeModuleAction(ctx, flags, args, (ctx, module) => {
            const imageName = dockerUtils.imageName(ctx.config.id, module.name)
            const dockerfile = ctx.config.toDockerfile(module.name)

            dockerUtils.buildImage(imageName, dockerfile, flags['no-cache'], flags['pull'])

            logger.infoWithTime(`Image for ${module.name} built`, true)
          })
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Starting modules')

          executeModuleAction(ctx, flags, args, StartCommand.startModule)
        }
      }
    ]

    await runTask(tasks)
  }

  static startModule(ctx, module) {
    const imageName = dockerUtils.imageName(ctx.config.id, module.name)
    const containerName = dockerUtils.containerName(ctx.config.id, module.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      logger.infoWithTime(`Module "${module.name}" is already running`, true)
    } else {
      const result = dockerUtils.startContainer(module.volumes, module.ports, containerName, imageName)

      if (result.stderr.length > 0) {
        throw new VoilaError(result.stderr)
      } else {
        logger.infoWithTime(`Module "${module.name}" started`, true)
      }
    }
  }
}

StartCommand.description = `Start module containers.`

StartCommand.args = [
  {
    name: 'module',
    required: false,
    description: 'Module name to start.'
  }
]

StartCommand.flags = {
  'all': flags.boolean({
    description: `Start all modules in the project.`,
    default: false
  }),
  'no-cache': flags.boolean({
    description: `Don't use cache when building the image.`,
    default: false
  }),
  'pull': flags.boolean({
    description: `Always attempt to pull a newer version of the image.`,
    default: false
  })
}

module.exports = StartCommand
