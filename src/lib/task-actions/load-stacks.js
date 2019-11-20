const PenguinError = require('../error/penguin-error')
const errorMessages = require('../error/messages')
const {doesCurrentPathContain, relativeStackHostPath} = require('../paths')
const inquirer = require('inquirer')

exports.loadStacks = async (ctx, docker, flags, args,
                            withAssumptions = false,
                            promptAllStacks = false) => {
  const selectedStacks = []
  const runningContainers = docker.runningContainers(ctx.project.id)

  const stacksInCurrentPath = ctx.project.stacks.filter(stack => {
    return doesCurrentPathContain(relativeStackHostPath(stack))
  })

  const runningStacksInCurrentPath = stacksInCurrentPath.filter(s => {
    // match stack name (e.g., "python") with the last segment of container name (e.g., "penguin-jas123-python)
    return runningContainers.find(c => s.name === c.split('-')[2])
  })

  if (flags['all']) {
    ctx.project.stacks.map((stack) => selectedStacks.push(stack))
  } else if (flags['stack-name']) {
    selectedStacks.push(ctx.project.getStack(flags['stack-name']))
  } else if (ctx.project.stacks.length === 1) {
    selectedStacks.push(ctx.project.stacks[0])
  } else if (withAssumptions && runningStacksInCurrentPath.length === 1) {
    selectedStacks.push(runningStacksInCurrentPath[0])
  } else if (stacksInCurrentPath.length === 1) {
    selectedStacks.push(stacksInCurrentPath[0])
  } else if (stacksInCurrentPath.length > 1) {
    const stacks = promptAllStacks ? ctx.project.stacks : stacksInCurrentPath

    await addStacksFromResponse(
      docker, ctx.project.id, stacks, selectedStacks, ctx.project.stacks)
  } else {
    throw new PenguinError(errorMessages.SPECIFY_STACK_NAME)
  }

  ctx.stacks = selectedStacks
}

exports.loadAllStacks = async ctx => {
  const selectedStacks = []

  ctx.project.stacks.map((stack) => selectedStacks.push(stack))

  ctx.stacks = selectedStacks
}

addStacksFromResponse = async (docker, projectId, choiceStacks, selectedStacks, allStacks) => {
  const decorateName = name => `${name} - ${docker.isStackRunning(projectId, name) ? 'running' : 'stopped'}`
  const choices = choiceStacks.map(s => { return {
    name: decorateName(s.name),
    value: s.name
  }})

  if (choices.length === 1) {
    selectedStacks.push(allStacks.find(s => s.name === choices[0].value))
  } else {
    const response = await inquirer.prompt([{
      name: 'stack',
      message: 'Multiple stacks detected. What stack should be used?',
      type: 'list',
      choices: choices,
    }])

    selectedStacks.push(allStacks.find(s => s.name === response.stack))
  }
}
