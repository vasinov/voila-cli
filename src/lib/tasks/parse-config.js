const logger = require('../logger')
const ConfigManager = require('../config/manager')

exports.task = (ctx, verbose = true) => {
  if (verbose) logger.infoWithTime('Parsing and validating config')

  ctx.config = new ConfigManager(ctx.config)
}
