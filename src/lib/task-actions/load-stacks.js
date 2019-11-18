const PenguinError = require('../error/penguin-error')
const errorMessages = require('../error/messages')
const {doesCurrentPathContain, relativeStackHostPath} = require('../paths')
const inquirer = require('inquirer')

exports.loadStacks = async (ctx, docker, flags, args, noAssumptions = true) => {
  const selectedStacks = []
  const runningContainers = docker.runningContainers(ctx.config.projectId)

  const stacksInCurrentPath = ctx.config.projectStacks.filter(stack => {
    return doesCurrentPathContain(relativeStackHostPath(stack))
  })

  const runningStacksInCurrentPath = stacksInCurrentPath.filter(s => {
    // match stack name (e.g., "python") with the last segment of container name (e.g., "penguin-jas123-python)
    return runningContainers.find(c => s.name === c.split('-')[2])
  })

  if (flags['all']) {
    ctx.config.projectStacks.map((stack) => selectedStacks.push(stack))
  } else if (args['stack-name']) {
    selectedStacks.push(ctx.config.getStack(args['stack-name']))
  } else if (flags['stack-name']) {
    selectedStacks.push(ctx.config.getStack(flags['stack-name']))
  } else if (ctx.config.projectStacks.length === 1) {
    selectedStacks.push(ctx.config.projectStacks[0])
  } else if (!noAssumptions && runningStacksInCurrentPath.length === 1) {
    selectedStacks.push(runningStacksInCurrentPath[0])
  } else if (stacksInCurrentPath.length === 1) {
    selectedStacks.push(stacksInCurrentPath[0])
  } else if (stacksInCurrentPath.length > 1) {
    await addStacksFromResponse(stacksInCurrentPath, selectedStacks, ctx.config.projectStacks)
  } else {
    throw new PenguinError(errorMessages.SPECIFY_STACK_NAME)
  }

  ctx.stacks = selectedStacks
}

exports.loadAllStacks = async (ctx) => {
  const selectedStacks = []

  ctx.config.projectStacks.map((stack) => selectedStacks.push(stack))

  ctx.stacks = selectedStacks
}

exports.promptAllStacks = async (ctx) => {
  const selectedStacks = []

  await addStacksFromResponse(ctx.config.projectStacks, selectedStacks, ctx.config.projectStacks)

  ctx.stacks = selectedStacks
}

addStacksFromResponse = async (choiceStacks, selectedStacks, allStacks) => {
  const choices = choiceStacks.map(s => { return { name: s.name } })

  const response = await inquirer.prompt([{
    name: 'stack',
    message: 'Multiple stacks detected. What stack should be used?',
    type: 'list',
    choices: choices,
  }])

  selectedStacks.push(allStacks.find(s => s.name === response.stack))
}
