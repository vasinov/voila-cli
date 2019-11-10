const logger = require('../logger')
const {loadConfig} = require('../config/loader')
const ConfigManager = require('../config/manager')

exports.task = (ctx, verbose = true) => {
  if (verbose) logger.infoWithTime('Loading config')

  const [message, config] = loadConfig()

  ctx.config = new ConfigManager(config)

  if (message) logger.warn(message)
}
