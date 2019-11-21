const {flags} = require('@oclif/command')
const {parseArgsStringToArgv} = require('string-argv')

const BaseCommand = require('./base')
const {buildConfig, loadStacks} = require('../lib/task-actions')
const {runTask} = require('../lib/task-runner')
const logger = require('../lib/logger')
const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')

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
            const imageName = this.docker.imageName(ctx.project.id, stack.name)

            logger.infoWithTime(`Building image for the "${stack.name}" stack`, true)

            this.docker.buildImage(
              imageName, stack.dockerfile, flags['no-cache'], flags['pull'], !flags['less-verbose'])

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
    const imageName = this.docker.imageName(ctx.project.id, stack.name)
    const containerName = this.docker.containerName(ctx.project.id, stack.name)
    const command = stack.runCommands.find(c => c.name === flags['run-command'])

    if (this.docker.isContainerRunning(containerName)) {
      logger.infoWithTime(`Stack "${stack.name}" is already running`, true)
    } else if (command) {
      const parsed = parseArgsStringToArgv(command.run)
      const entrypoint = parsed[0]
      const entrypointArgs = parsed.length > 1 ? parsed.slice(1, parsed.length) : []

      if (command.headless) {
        this.docker.startContainer(stack, containerName, imageName, flags['persist'],
          { attached: false, entrypoint: entrypoint, args: entrypointArgs })

        logger.infoWithTime(`Stack "${stack.name}" started`, true)
      } else {
        logger.infoWithTime(`Executing "${command.run}" in stack "${stack.name}"`, true)

        this.docker.startContainer(stack, containerName, imageName, flags['persist'],
          { attached: true, entrypoint: entrypoint, args: entrypointArgs })

        logger.infoWithTime(`Stack "${stack.name}" stopped`, true)
      }

    } else {
      throw new PenguinError(errorMessages.runCommandNotFound(flags['run-command']))
    }
  }
}

StartCommand.description = `Start stacks.`

StartCommand.flags = {
  'stack-name': flags.string({
    description: `Specify stack name.`
  }),
  'run-command': flags.string({
    description: `Specify a run command defined in the run.commands list in your stack YAML config file.`,
    default: 'default'
  }),
  'all': flags.boolean({
    description: `Start all stacks in the project.`
  }),
  'no-cache': flags.boolean({
    description: `Don't use cache when building stack image.`
  }),
  'pull': flags.boolean({
    description: `Always attempt to pull newer versions of Docker images.`
  }),
  'persist': flags.boolean({
    description: `Don't remove the container when it stops.`
  }),
  'less-verbose': flags.boolean({
    description: `Don't show image building output.`
  })
}

StartCommand.hidden = false

module.exports = StartCommand
