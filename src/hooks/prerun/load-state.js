const Storage = require('../../lib/storage')

module.exports = async function (opts) {
  opts.storage = new Storage(opts.config.configDir)

  opts.storage.init()
}
