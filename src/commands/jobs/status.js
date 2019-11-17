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
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => {
          const data = Object.entries(Job.list(this.storage, ctx.config.projectId)).map(e => {
            const jobJson = e[1]
            const containerName = this.docker.containerName(jobJson.projectId, jobJson.stackName)

            const status = jobJson.wasKilled ?
              'killed':
              this.docker.isJobRunning(containerName, jobJson.id) ?
                'running':
                'finished'

            jobJson.queuedAt = new Date(jobJson.queuedAt).toLocaleString()
            jobJson.startedAt = new Date(jobJson.startedAt).toLocaleString()
            jobJson.status = status

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
