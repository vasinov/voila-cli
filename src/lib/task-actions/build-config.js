const logger = require('../logger')
const {loadUserConfig} = require('../config/loader')
const Project = require('../config/project')

exports.task = (ctx, verbose = false) => {
  if (verbose) logger.infoWithTime('Loading config')

  const userConfig = loadUserConfig()

  ctx.project = new Project(userConfig.config)

  if (userConfig.message) logger.warn(userConfig.message)
}
