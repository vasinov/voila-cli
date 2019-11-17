const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
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

GetCommand.hidden = false

module.exports = GetCommand
