const {Command, flags} = require('@oclif/command')

const ConfigManager = require('../lib/config/manager')
const {loadConfig} = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const {relativeModulePath, moduleHostPath, doesPathIncludeCurrentPath} = require('../lib/paths')

class SshCommand extends Command {
  async run() {
    const cmd = this
    const {flags} = this.parse(SshCommand)

    const tasks = [
      {
        title: 'Loading config',
        silent: true,
        action: ctx => {
          const [message, config] = loadConfig()

          ctx.config = config

          if (message) cmd.warn(message)
        }
      },
      {
        title: 'Parsing and validating config',
        silent: true,
        action: ctx => {
          ctx.config = new ConfigManager(ctx.config)
        }
      },
      {
        title: 'Connecting over SSH',
        action: async ctx => {
          const containerName = flags['container-name']
          const executeIn = flags['execute-in']

         if (ctx.config.modules.length === 0) {
           throw new VoilaError(errorMessages.DEFINE_MODULES)
         } else if (containerName) {
           this.processSsh(ctx, containerName, executeIn)
         } else if (ctx.config.modules.length === 1) {
           this.processSsh(ctx, ctx.config.modules[0].name, executeIn)
         } else {
           throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
         }
        }
      }
    ]

    await runTask(tasks, this)
  }

  processSsh(ctx, moduleName, executeIn) {
    const containerName = dockerUtils.containerName(ctx.config.id, moduleName)

    if (dockerUtils.isContainerRunning(containerName)) {
      const module = ctx.config.getModule(moduleName)

      if (executeIn || doesPathIncludeCurrentPath(moduleHostPath(module))) {
        const workdir = (executeIn) ? executeIn : relativeModulePath(module).join('/')
        const subProcess = dockerUtils.sshContainer(containerName, workdir)

        subProcess.on('exit', code => {
          if (code !== 0) this.log(errorMessages.SSH_SESSION_INTERRUPTED)
        })

        subProcess.on('error', code => {
          this.log(errorMessages.containerError(containerName, code, 'SSH session'))
        })
      } else {
        throw new VoilaError(errorMessages.wrongModuleHostDirError(moduleHostPath(module).join('/')))
      }
    } else {
      throw new VoilaError(errorMessages.NO_RUNNING_MODULES)
    }
  }
}

SshCommand.description = `Connect to a container over SSH.`

SshCommand.flags = {
  'container-name': flags.string({
    description: `Specify container name.`
  }),
  'execute-in': flags.string({
    description: `Specify an absolute path inside the container to SSH into.`
  })
}

module.exports = SshCommand
