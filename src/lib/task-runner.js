const ValidationError = require('jsonschema').ValidationError
const CliError = require('./error/cli-error')
const logger = require('../lib/logger')

exports.runTask = async (tasks, ctx = {}) => {
  if (!ctx.hasOwnProperty('stacks')) ctx.stacks = []

  try {
    for (const task of tasks) {
      if (task.skip && task.skip(ctx)) {
        continue
      } else {
        await task.action(ctx)
      }
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error(`YAML config validation failed: ${error.stack.replace(/instance/g, 'root')}`)
    } else if (error instanceof CliError) {
      logger.error(error.message.trim())
    } else {
      logger.error(error.stack)
    }

    process.exit(1)
  }
}
