const ValidationError = require('jsonschema').ValidationError
const PenguinError = require('./error/penguin-error')
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
    } else if (error instanceof PenguinError) {
      logger.error(error.message)
    } else {
      logger.error(error.stack)
    }

    process.exit(1)
  }
}
