const {cli} = require('cli-ux')
const os = require('os')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const ApiClient = require('../../lib/api-client')

class LogoutCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(LogoutCommand)

    const tasks = [
      {
        action: async ctx => {
          if (ApiClient.getAccessToken(this.storage)) {
            ApiClient.removeAccessToken(this.storage)

            logger.info(`You are logged out now.`)
          } else {
            logger.warn(`You are not logged in.`)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

LogoutCommand.description = `Logout from Voila.`

LogoutCommand.aliases = ['logout']

LogoutCommand.hidden = false

module.exports = LogoutCommand
