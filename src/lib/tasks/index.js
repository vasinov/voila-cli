const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.executeModuleAction = (ctx, flags, args, action) => {
  const defaultModule = ctx.config.getDefaultModule()

  if (flags['all']) {
    ctx.config.modules.map((module) => {
      action(ctx, module)
    })
  } else if (args.module) {
    action(ctx, ctx.config.getModule(args.module))
  } else if (defaultModule) {
    action(ctx, defaultModule)
  } else {
    throw new VoilaError(errorMessages.SPECIFY_MODULE_NAME)
  }
}
