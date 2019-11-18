const logger = require('../logger')
const {loadUserConfig} = require('../config/loader')
const Builder = require('../config/builder')

exports.task = (ctx, verbose = false) => {
  if (verbose) logger.infoWithTime('Loading config')

  const userConfig = loadUserConfig()

  ctx.config = new Builder(userConfig.config)

  if (userConfig.message) logger.warn(userConfig.message)
}
