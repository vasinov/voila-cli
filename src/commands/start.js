const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {runTask} = require('../lib/task-runner')
const logger = require('../lib/logger')

class StartCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StartCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, true)
      },
      {
        action: ctx => loadStacks(ctx, this.docker, flags, args)
      },
      {
        action: ctx => {
          logger.infoWithTime('Downloading dependencies and building images')

          ctx.stacks.forEach(stack => {
            const imageName = this.docker.imageName(ctx.config.projectId, stack.name)

            logger.infoWithTime(`Building image for the "${stack.name}" stack`, true)

            this.docker.buildImage(imageName, stack.dockerfile, flags['no-cache'], flags['pull'], flags['verbose'])

            logger.infoWithTime(`Image for the "${stack.name}" stack finished building`, true)
          })
        }
      },
      {
        action: ctx => {
          logger.infoWithTime('Starting stacks')

          ctx.stacks.forEach((stack) => this.initStack(ctx, stack, flags))
        }
      }
    ]

    await runTask(tasks)
  }

  initStack(ctx, stack, flags) {
    const imageName = this.docker.imageName(ctx.config.projectId, stack.name)
    const containerName = this.docker.containerName(ctx.config.projectId, stack.name)
    const command = stack.entrypointCommand

    if (this.docker.isContainerRunning(containerName)) {
      logger.infoWithTime(`Stack "${stack.name}" is already running`, true)
    } else if (command) {
      logger.infoWithTime(`Executing "${command}" in stack "${stack.name}"`, true)

      this.docker.startContainer(stack, containerName, imageName, flags['persist'], command)

      logger.infoWithTime(`Stack "${stack.name}" stopped`, true)
    } else {
      this.docker.startContainer(stack, containerName, imageName, flags['persist'])

      logger.infoWithTime(`Stack "${stack.name}" started`, true)
    }
  }
}

StartCommand.description = `Start stacks.`

StartCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'all': flags.boolean({
    description: `Start all stacks in the project.`
  }),
  'no-cache': flags.boolean({
    description: `Don't use cache when building stack images.`
  }),
  'pull': flags.boolean({
    description: `Always attempt to pull newer versions of Docker images.`
  }),
  'persist': flags.boolean({
    description: `Don't remove the container when it stops.`
  }),
  'verbose': flags.boolean({
    description: `Show all output.`
  })
}

StartCommand.hidden = false

module.exports = StartCommand
