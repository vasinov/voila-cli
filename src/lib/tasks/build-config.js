const logger = require('../logger')
const {loadUserConfig} = require('../config/loader')
const Builder = require('../config/builder')

exports.task = (ctx, verbose = true) => {
  if (verbose) logger.infoWithTime('Loading config')

  const [message, userConfig] = loadUserConfig()

  ctx.config = new Builder(userConfig)

  if (message) logger.warn(message)
}
