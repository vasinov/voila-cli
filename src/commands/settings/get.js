const {Command} = require('@oclif/command')

const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')

class GetCommand extends Command {
  async run() {
    const {flags, args} = this.parse(GetCommand)
    const storage = this.config.storage

    const tasks = [
      {
        action: ctx => {
          logger.info(storage.get('settings', args['key']))
        }
      }
    ]

    await runTask(tasks)
  }
}

GetCommand.description = `Get a Penguin setting.`

GetCommand.args = [
  {
    name: 'key',
    required: true,
    description: 'Name of the setting.'
  }
]

module.exports = GetCommand
