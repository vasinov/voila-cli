const logger = require('../logger')
const {loadConfig} = require('../config/loader')

exports.task = (ctx, verbose = true) => {
  if (verbose) logger.infoWithTime('Loading config')

  const [message, config] = loadConfig()

  ctx.config = config

  if (message) logger.warn(message)
}
