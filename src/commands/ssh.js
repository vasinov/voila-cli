const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {runTask} = require('../lib/task-runner')
const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')
const {hostToStackAbsolutePath, relativeStackHostPath, doesCurrentPathContain} = require('../lib/paths')
const logger = require('../lib/logger')

class SshCommand extends BaseCommand {
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

            const containerName = this.docker.containerName(ctx.config.projectId, stack.name)

            if (this.docker.isContainerRunning(containerName)) {

              if (executeIn || doesCurrentPathContain(relativeStackHostPath(stack))) {
                const workdir = (executeIn) ? executeIn : hostToStackAbsolutePath(stack).join('/')

                this.docker.sshContainer(containerName, workdir)
              } else {
                throw new PenguinError(errorMessages.wrongStackHostDirError(relativeStackHostPath(stack).join('/')))
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

SshCommand.hidden = false

module.exports = SshCommand
