const {Command, flags} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class StartCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StartCommand)

    const tasks = [
      {
        action: ctx => {
          logger.infoWithTime('Loading config')

          const [message, config] = loadConfig()

          ctx.config = config

          if (message) logger.warn(message)
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Parsing and validating config')

          ctx.config = new ConfigManager(ctx.config)
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Downloading dependencies and building images')

          this.executeAction(ctx, flags, args, (ctx, module) => {
            const imageName = dockerUtils.imageName(ctx.config.id, module.name)
            const dockerfile = ctx.config.toDockerfile(module.name)

            dockerUtils.buildImage(imageName, dockerfile, flags['no-cache'], flags['pull'])

            logger.infoWithTime(`Built image for ${module.name}`, true)
          })
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Starting modules')

          this.executeAction(ctx, flags, args, StartCommand.startModule)
        }
      }
    ]

    await runTask(tasks)
  }

  executeAction(ctx, flags, args, action) {
    const defaultModule = ctx.config.getDefaultModule()

    if (flags['all']) {
      ctx.config.modules.map((module) => {
        action(ctx, module)
      })
    } else if (args.module) {
      action(ctx, ctx.config.getModule(args.module))
    } else if (defaultModule) {
      action(ctx, defaultModule)
    } else {
      throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
    }
  }

  static startModule(ctx, module) {
    const imageName = dockerUtils.imageName(ctx.config.id, module.name)
    const containerName = dockerUtils.containerName(ctx.config.id, module.name)

    if (dockerUtils.isContainerRunning(containerName)) {
      logger.infoWithTime(`Container ${containerName} is already running`, true)
    } else {
      const result = dockerUtils.startContainer(module.volumes, module.ports, containerName, imageName)

      if (result.stderr.length > 0) {
        throw new VoilaError(result.stderr)
      } else {
        logger.infoWithTime(`Started container ${containerName} for module ${module.name}`, true)
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
