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
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => loadStacks(ctx, this.docker, flags, args, false)
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

                logger.dimInfo(`SSHing into ${containerName}:${workdir}`)

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

SshCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'stack-path': flags.string({
    description: `Specify an absolute path inside the container to SSH into.`
  })
}

SshCommand.hidden = false

module.exports = SshCommand
