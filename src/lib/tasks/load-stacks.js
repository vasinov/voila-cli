const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')
const {doesCurrentPathContainPath, stackHostPath} = require('../paths')
const inquirer = require('inquirer')

exports.task = async (ctx, flags, args, showAll = false) => {
  const selectedStacks = []

  const stacksInCurrentPath = ctx.config.allStacks.filter(stack => {
    return doesCurrentPathContainPath(stackHostPath(stack))
  })

  if (flags['all']) {
    ctx.config.allStacks.map((stack) => selectedStacks.push(stack))
  } else if (args['stack-name']) {
    selectedStacks.push(ctx.config.getStack(args['stack-name']))
  } else if (flags['stack-name']) {
    selectedStacks.push(ctx.config.getStack(flags['stack-name']))
  } else if (ctx.config.allStacks.length === 1) {
    selectedStacks.push(ctx.config.allStacks[0])
  } else if (stacksInCurrentPath.length === 1) {
    selectedStacks.push(stackHostPath(stacksInCurrentPath[0]))
  } else if (stacksInCurrentPath.length > 1) {
    const choices = showAll ?
      ctx.config.allStacks.map(m => { return { name: m.name } }) :
      stacksInCurrentPath.map(m => { return { name: m.name } })

    const response = await inquirer.prompt([{
      name: 'stack',
      message: 'Multiple stacks detected. What stack should be loaded?',
      type: 'list',
      choices: choices,
    }])

    selectedStacks.push(stacksInCurrentPath.find(m => m.name === response.stack))
  } else {
    throw new VoilaError(errorMessages.SPECIFY_STACK_NAME)
  }

  ctx.stacks = selectedStacks
}
