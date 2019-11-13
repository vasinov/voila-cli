const {Command, flags} = require('@oclif/command')

const initializer = require('../lib/config/initializer')
const runTask = require('../lib/run-task')
const logger = require('../lib/logger')

class InitCommand extends Command {
  async run() {
    const {flags} = this.parse(InitCommand)

    const tasks = [
      {
        action: async () => {
          logger.infoWithTime('Generating new config files')

          initializer.init(flags.force)

          logger.infoWithTime(
            `New ".voila" folder with config files was successfully generated in the current directory.`, true)
        }
      }
    ]

    await runTask(tasks)
  }
}

InitCommand.description = `Initialize Voila in the current directory. This command creates a ".voila" folder with YAML config files.`

InitCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: `Override an existing config folder.`,
    default: false
  })
}

module.exports = InitCommand
