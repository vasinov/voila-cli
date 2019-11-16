const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')

class StatusCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => {
          const data = Object.entries(Job.list(this.storage)).map(e => {
            const data = e[1]

            data.queuedAt = new Date(data.queuedAt).toLocaleString()
            data.startedAt = new Date(data.startedAt).toLocaleString()
            data.status = "unknown"

            return data
          }).reverse()

          logger.table({
            id: { header: 'Job ID' },
            command: { header: 'Command' },
            savingOutput: { header: 'Saving Output' },
            startedAt: { header: 'Started at' },
            status: { header: 'Status' }
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

StatusCommand.description = `Show status of all jobs.`

StatusCommand.hidden = false

module.exports = StatusCommand
