const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const Job = require('../../lib/job')
const {buildConfig} = require('../../lib/task-actions')

class CleanupCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(CleanupCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: ctx => {
          logger.infoWithTime(`Starting jobs cleanup`)

          Object.entries(Job.list(this.storage, ctx.config.projectId)).map(e => {
            const job = Job.fromJson(this.storage, e[1])

            switch (job.status(this.docker)) {
              case 'killed':
              case 'finished':
                logger.infoWithTime(`Removing job ${job.id}`, true)

                job.clear()
                break
              default:
                break;
            }
          })

          logger.infoWithTime(`Jobs cleanup complete`)
        }
      }
    ]

    await runTask(tasks)
  }
}

CleanupCommand.description = `Remove finished and killed jobs. Running jobs won't get affected.`

CleanupCommand.hidden = false

module.exports = CleanupCommand
