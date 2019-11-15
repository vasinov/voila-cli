const {Command, flags} = require('@oclif/command')

const {buildConfig, loadStacks} = require('../lib/task-actions')
const runTask = require('../lib/run-task')
const dockerUtils = require('../lib/docker-utils')
const PenguinError = require('../lib/error/penguin-error')
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
            const executeIn = flags['stack-path']

            const containerName = dockerUtils.containerName(ctx.config.projectId, stack.name)

            if (dockerUtils.isContainerRunning(containerName)) {

              if (executeIn || doesCurrentPathContainPath(stackHostPath(stack))) {
                const workdir = (executeIn) ? executeIn : relativeStackPath(stack).join('/')

                dockerUtils.sshContainer(containerName, workdir)
              } else {
                throw new PenguinError(errorMessages.wrongStackHostDirError(stackHostPath(stack).join('/')))
              }
            } else {
              throw new PenguinError(errorMessages.stackNotRunningError(stack.name))
            }
          })
        }
      }
    ]

    await runTask(tasks)
  }
}

SshCommand.description = `Connect to a stack over SSH.`

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
