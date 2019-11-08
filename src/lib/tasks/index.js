const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.loadConfig = require('./load-config').task
exports.parseConfig = require('./parse-config').task

exports.executeModuleAction = (ctx, flags, args, action) => {
  const modules = ctx.config.modules

  if (flags['all']) {
    modules.map((module) => {
      action(ctx, module)
    })
  } else if (args.module) {
    action(ctx, ctx.config.getModule(args.module))
  } else if (flags['module-name']) {
    action(ctx, ctx.config.getModule(flags['module-name']))
  } else if (modules.length === 1) {
    action(ctx, modules[0])
  } else {
    throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
  }
}
