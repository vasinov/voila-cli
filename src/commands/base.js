const {Command} = require('@oclif/command')

const Storage = require('../lib/storage')

class BaseCommand extends Command {
  async init() {
    this.storage = new Storage(this.config.configDir)

    this.storage.init()
  }
}

BaseCommand.hidden = true

module.exports = BaseCommand
