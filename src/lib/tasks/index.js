const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.loadConfig = require('./load-config').task
exports.parseConfig = require('./parse-config').task

exports.executeModuleAction = (ctx, flags, args, action) => {
  const defaultModule = ctx.config.getDefaultModule()

  if (flags['all']) {
    ctx.config.modules.map((module) => {
      action(ctx, module)
    })
  } else if (args.module) {
    action(ctx, ctx.config.getModule(args.module))
  } else if (flags['module-name']) {
    action(ctx, ctx.config.getModule(flags['module-name']))
  } else if (defaultModule) {
    action(ctx, defaultModule)
  } else {
    throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
  }
}
