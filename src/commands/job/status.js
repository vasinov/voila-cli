const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const {buildConfig} = require('../../lib/task-actions')

class StatusCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => {
          const data = Object.entries(Job.list(this.storage, ctx.project.id)).map(e => {
            const job = Job.fromJson(this.storage, e[1])
            const jobJson = job.toJson()

            jobJson.startedAt = new Date(job.startedAt).toLocaleString()
            jobJson.status = job.status(this.docker)

            return jobJson
          })

          logger.table({
            id: { header: 'Job ID' },
            stackName: { header: 'Stack' },
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
