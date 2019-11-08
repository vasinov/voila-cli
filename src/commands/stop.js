const {Command, flags} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const {executeModuleAction} = require('../lib/tasks')
const logger = require('../lib/logger')

class StopCommand extends Command {
  async run() {
    const {flags, args} = this.parse(StopCommand)

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
          logger.infoWithTime('Stopping modules')

          executeModuleAction(ctx, flags, args, (ctx, module) => {
            const containerName = dockerUtils.containerName(ctx.config.id, module.name)
            const localdir = process.cwd()
            const workdir = ctx.config.findInDockerfileData(module.name, 'working_dir')

            if (dockerUtils.isContainerRunning(containerName)) {
              dockerUtils.stopContainer(localdir, workdir, containerName)

              logger.infoWithTime(`Module "${module.name}" stopped`, true)
            } else {
              logger.infoWithTime(`Module "${module.name}" was not running`, true)
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
    name: 'module',
    required: false,
    description: 'Module name to stop.'
  }
]

StopCommand.flags = {
  'all': flags.boolean({
    description: `Stop all modules in the project.`,
    default: false
  })
}

module.exports = StopCommand
