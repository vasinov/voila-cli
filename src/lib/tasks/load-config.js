const logger = require('../logger')
const {loadConfig} = require('../config/loader')
const ConfigBuilder = require('../config/builder')

exports.task = (ctx, verbose = true) => {
  if (verbose) logger.infoWithTime('Loading config')

  const [message, projectConfig] = loadConfig()

  ctx.config = new ConfigBuilder(projectConfig)

  if (message) logger.warn(message)
}
