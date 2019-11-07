const {Command, flags} = require('@oclif/command')

const initializer = require('../../lib/config/initializer')
const runTask = require('../../lib/run-task')

class InitCommand extends Command {
  async run() {
    const {flags} = this.parse(InitCommand)
    const cmd = this

    const tasks = [
      {
        title: 'Generating new config files',
        action: async () => {
          initializer.init(flags.force)

          return `New ".voila" folder with config files was successfully generated in the current directory.`
        }
      }
    ]

    await runTask(tasks, cmd)
  }
}

InitCommand.aliases = ['init']

InitCommand.description = `Initialize Voila in the current directory. This command creates a ".voila" folder with YAML config files.`

InitCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: `Override an existing config folder.`,
    default: false
  })
}

module.exports = InitCommand
