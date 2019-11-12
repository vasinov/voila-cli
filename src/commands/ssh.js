const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/tasks')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const {relativeStackPath, stackHostPath, doesCurrentPathContainPath} = require('../lib/paths')
const logger = require('../lib/logger')

class SshCommand extends Command {
  async run() {
    const {flags, args} = this.parse(SshCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => loadStacks(ctx, flags, args)
      },
      {
        title: 'Connecting over SSH',
        action: async ctx => {
          ctx.stacks.forEach(stack => {
            this.processSsh(ctx, stack, flags['stack-path'])
          })
        }
      }
    ]

    await runTask(tasks)
  }

  processSsh(ctx, stack, executeIn) {
    const containerName = dockerUtils.containerName(ctx.config.id, stack.name)

    if (dockerUtils.isContainerRunning(containerName)) {

      if (executeIn || doesCurrentPathContainPath(stackHostPath(stack))) {
        const workdir = (executeIn) ? executeIn : relativeStackPath(stack).join('/')
        const subProcess = dockerUtils.sshContainer(containerName, workdir)

        subProcess.on('exit', code => {
          if (code !== 0) logger.error(errorMessages.SSH_SESSION_INTERRUPTED)
        })

        subProcess.on('error', code => {
          logger.error(errorMessages.containerError(containerName, code, 'SSH session'))
        })
      } else {
        throw new VoilaError(errorMessages.wrongStackHostDirError(stackHostPath(stack).join('/')))
      }
    } else {
      throw new VoilaError(errorMessages.stackNotRunningError(stack.name))
    }
  }
}

SshCommand.description = `Connect to a container over SSH.`

SshCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Stack name to SSH into.'
  }
]

SshCommand.flags = {
  'stack-path': flags.string({
    description: `Specify an absolute path inside the container to SSH into.`
  })
}

module.exports = SshCommand
