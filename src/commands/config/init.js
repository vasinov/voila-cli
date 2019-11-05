const {Command, flags} = require('@oclif/command')

const initializer = require('../../lib/config/initializer')
const runTask = require('../../lib/run-task')

class InitCommand extends Command {
  async run() {
    const {flags} = this.parse(InitCommand)
    const cmd = this

    const tasks = [
      {
        title: 'Generating a new config file',
        action: async () => {
          initializer.init(flags.force)

          return `New ".voila.yml" file was successfully generated in the current directory`
        }
      }
    ]

    await runTask(tasks, cmd)
  }
}

InitCommand.aliases = ['init']

InitCommand.description = `create a new config file`

InitCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: `override existing config file`,
    default: false
  })
}

module.exports = InitCommand
