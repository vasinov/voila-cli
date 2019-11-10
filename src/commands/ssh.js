const {Command, flags} = require('@oclif/command')

const {loadConfig, loadModules} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const {relativeModulePath, moduleHostPath, doesCurrentPathContainPath} = require('../lib/paths')
const logger = require('../lib/logger')

class SshCommand extends Command {
  async run() {
    const {flags, args} = this.parse(SshCommand)

    const tasks = [
      {
        action: ctx => loadConfig(ctx, false)
      },
      {
        action: ctx => loadModules(ctx, flags, args, false, false)
      },
      {
        title: 'Connecting over SSH',
        action: async ctx => {
          ctx.modules.forEach(module => {
            this.processSsh(ctx, module, flags['module-path'])
          })
        }
      }
    ]

    await runTask(tasks)
  }

  processSsh(ctx, module, executeIn) {
    const containerName = dockerUtils.containerName(ctx.config.id, module.name)

    if (dockerUtils.isContainerRunning(containerName)) {

      if (executeIn || doesCurrentPathContainPath(moduleHostPath(module))) {
        const workdir = (executeIn) ? executeIn : relativeModulePath(module).join('/')
        const subProcess = dockerUtils.sshContainer(containerName, workdir)

        subProcess.on('exit', code => {
          if (code !== 0) logger.error(errorMessages.SSH_SESSION_INTERRUPTED)
        })

        subProcess.on('error', code => {
          logger.error(errorMessages.containerError(containerName, code, 'SSH session'))
        })
      } else {
        throw new VoilaError(errorMessages.wrongModuleHostDirError(moduleHostPath(module).join('/')))
      }
    } else {
      throw new VoilaError(errorMessages.moduleNotRunningError(module.name))
    }
  }
}

SshCommand.description = `Connect to a container over SSH.`

SshCommand.args = [
  {
    name: 'module-name',
    required: false,
    description: 'Module name to SSH into.'
  }
]

SshCommand.flags = {
  'module-path': flags.string({
    description: `Specify an absolute path inside the container to SSH into.`
  })
}

module.exports = SshCommand
