const {Command, flags} = require('@oclif/command')

const {loadConfig, loadModules} = require('../lib/tasks')
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
        action: ctx => loadModules(ctx, flags, args)
      },
      {
        action: ctx => {
          logger.infoWithTime('Downloading dependencies and building images')

          ctx.modules.forEach(module => {
            const imageName = dockerUtils.imageName(ctx.config.id, module.name)
            const dockerfile = ctx.config.toDockerfile(module.name)

            dockerUtils.buildImage(imageName, dockerfile, flags['no-cache'], flags['pull'])

            logger.infoWithTime(`Image for ${module.name} built`, true)
          })
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Initializing modules')

          ctx.modules.forEach((module) => StartCommand.initModule(ctx, module))
        }
      }
    ]

    await runTask(tasks)
  }

  static initModule(ctx, module) {
    const imageName = dockerUtils.imageName(ctx.config.id, module.name)
    const containerName = dockerUtils.containerName(ctx.config.id, module.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      logger.infoWithTime(`Module "${module.name}" is already running`, true)
    } else if (module.shouldStartAttached()) {
      logger.infoWithTime(`Module "${module.name}" running`, true)
      dockerUtils.startContainer(module.volumes, module.ports, containerName, imageName, true)
      logger.infoWithTime(`Module "${module.name}" stopped`, true)
    } else {
      const result = dockerUtils.startContainer(module.volumes, module.ports, containerName, imageName, false)

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
    name: 'module-name',
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
