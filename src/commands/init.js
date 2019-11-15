const {flags} = require('@oclif/command')

const BaseCommand = require('./base')
const initializer = require('../lib/config/initializer')
const runTask = require('../lib/run-task')
const logger = require('../lib/logger')

class InitCommand extends BaseCommand {
  async run() {
    const {flags} = this.parse(InitCommand)

    const tasks = [
      {
        action: async () => {
          logger.infoWithTime('Generating new config files')

          initializer.init(flags.force)

          logger.infoWithTime(
            `New ".penguin" folder with config files was successfully generated in the current directory.`, true)
        }
      }
    ]

    await runTask(tasks)
  }
}

InitCommand.description = `Initialize Penguin in the current directory. This command creates a ".penguin" folder with YAML config files.`

InitCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: `Override an existing config folder.`,
    default: false
  })
}

module.exports = InitCommand
