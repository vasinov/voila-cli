const {cli} = require('cli-ux')
const os = require('os')

const BaseCommand = require('../base')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const ApiClient = require('../../lib/api-client')

class LoginCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(LoginCommand)

    const tasks = [
      {
        action: async ctx => {
          if (ApiClient.getAccessToken(this.storage)) {
            logger.warn(`You are already logged in.`)
          } else {
            const email = await cli.prompt(`What's your Voila email?`, { required: true })
            const password = await cli.prompt(`What's your Voila password?`, { type: 'hide', required: true })
            const tokenName = `${(new Date()).toJSON().slice(0, 10)}-voila-cli-${os.hostname()}`
            const response = await this.apiClient.postTokens(email, password, tokenName)

            ApiClient.setAccessToken(this.storage, response.data.token)

            logger.info(`You are now logged in.`)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

LoginCommand.description = `Login with your Voila credentials.`

LoginCommand.aliases = ['login']

LoginCommand.hidden = false

module.exports = LoginCommand
