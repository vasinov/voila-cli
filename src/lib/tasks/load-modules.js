const logger = require('../logger')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')
const {doesCurrentPathContainPath, moduleHostPath} = require('../paths')

exports.task = (ctx, flags, args, loadAll = false, verbose = true) => {
  if (verbose) logger.infoWithTime('Loading modules')

  const selectedModules = []

  const modulesInCurrentPath = ctx.config.allModules.filter(module => {
    return doesCurrentPathContainPath(moduleHostPath(module))
  })

  if (loadAll || flags['all']) {
    ctx.config.allModules.map((module) => selectedModules.push(module))
  } else if (args.module) {
    selectedModules.push(ctx.config.getModule(args.module))
  } else if (flags['module-name']) {
    selectedModules.push(ctx.config.getModule(flags['module-name']))
  } else if (ctx.config.allModules.length === 1) {
    selectedModules.push(ctx.config.allModules[0])
  } else if (modulesInCurrentPath.length === 1) {
    selectedModules.push(moduleHostPath(modulesInCurrentPath[0]))
  } else if (modulesInCurrentPath.length > 1) {
    modulesInCurrentPath.forEach(m => selectedModules.push(m))
  } else {
    throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
  }

  ctx.modules = selectedModules
}
