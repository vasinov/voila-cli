const {Command} = require('@oclif/command')

const Storage = require('../lib/storage')
const Docker = require('../lib/docker')

class BaseCommand extends Command {
  async init() {
    this.storage = new Storage(this.config.configDir)

    this.storage.init()

    this.docker = new Docker(this.storage.get('settings', 'dockerPath'))
  }
}

BaseCommand.hidden = true

module.exports = BaseCommand
