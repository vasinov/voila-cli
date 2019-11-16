const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')

class ListCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(ListCommand)

    const tasks = [
      {
        action: ctx => {
          const data = Object.entries(Job.list(this.storage)).map(e => {
            const data = e[1]

            data.queuedAt = new Date(data.queuedAt).toLocaleString()
            data.startedAt = new Date(data.startedAt).toLocaleString()

            return data
          }).reverse()

          logger.table({
            id: { header: 'Job ID' },
            command: { header: 'Command' },
            savingOutput: { header: 'Saving Output' },
            startedAt: { header: 'Started at' },
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

ListCommand.description = `List all jobs.`

ListCommand.hidden = false

module.exports = ListCommand
