const {cli} = require('cli-ux')
const os = require('os')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const ApiClient = require('../../lib/api-client')

class TestCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(TestCommand)

    const tasks = [
      {
        action: async ctx => {
          if (ApiClient.getAccessToken(this.storage)) {
            await this.apiClient.getTokensTest().then(r => logger.info(r.message))
          } else {
            logger.warn(`You are not logged in.`)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

TestCommand.description = `Login with your Voila credentials.`

TestCommand.hidden = false

module.exports = TestCommand
