const {Command} = require('@oclif/command')

const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')

class ListCommand extends Command {
  async run() {
    const {flags, args} = this.parse(ListCommand)
    const storage = this.config.storage

    const tasks = [
      {
        action: ctx => {
          const data = Object.entries(storage.list('settings')).map(e => {
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

module.exports = ListCommand
