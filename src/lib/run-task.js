const ValidationError = require('jsonschema').ValidationError
const chalk = require('chalk')
const format = require('date-fns/format')
const VoilaError = require('./error/voila-error')

const runTask = async (tasks, renderer, ctx = {}) => {
  ctx.output = []

  try {
    for (const task of tasks) {
      if (task.skip && task.skip(ctx)) {
        continue
      } else {
        const isVerbose = task.silent === undefined || !task.silent

        if (isVerbose) renderer.log(`${timeLabel()} ${task.title}`)

        const result = await task.action(ctx)

        if (isVerbose) {
          if (Array.isArray(result)) {
            result.forEach(r => renderer.log(chalk.dim(`${timeLabel()} ↳ ${r}`)))
          } else if(typeof result === 'string') {
            renderer.log(chalk.dim(`${timeLabel()} ↳ ${result}`))
          }
        }
      }
    }

    return ctx.output
  } catch(error) {
    if (error instanceof ValidationError) {
      renderer.error(`YAML config validation failed: ${error.stack.replace(/instance/g, 'root')}`)
    } else if (error instanceof VoilaError) {
      renderer.error(error.message)
    } else {
      renderer.error(error.stack)
    }
  }
}

const timeLabel = () => {
  return chalk.dim(`[${format(new Date(), 'HH:mm:ss')}]`)
}

module.exports = runTask
