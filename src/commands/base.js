const {Command} = require('@oclif/command')

const Storage = require('../lib/storage')
const Docker = require('../lib/docker')
const ApiClient = require('../lib/api-client')

class BaseCommand extends Command {
  async init() {
    this.storage = new Storage(this.config.configDir)

    this.storage.init()

    this.docker = new Docker(this.storage.get('settings', 'dockerPath'))

    this.apiClient = new ApiClient(this.storage)
  }
}

BaseCommand.hidden = true

module.exports = BaseCommand
