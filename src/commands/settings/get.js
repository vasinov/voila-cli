const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')

class GetCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(GetCommand)

    const tasks = [
      {
        action: ctx => {
          logger.info(this.storage.get('settings', args['key']))
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
