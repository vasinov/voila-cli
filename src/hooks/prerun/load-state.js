const Storage = require('../../lib/storage')

module.exports = async function (opts) {
  opts.config.storage = new Storage(opts.config.configDir)

  opts.config.storage.init()
}
