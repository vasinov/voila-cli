const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')

class ListCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(ListCommand)

    const tasks = [
      {
        action: ctx => {
          const data = Object.entries(this.storage.list('settings')).map(e => {
            return {
              key: e[0],
              value: e[1]
            }
          })

          logger.table({
            key: { header: 'Key' },
            value: { header: 'Value' }
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

ListCommand.description = `List all Penguin settings.`

ListCommand.hidden = false

module.exports = ListCommand
