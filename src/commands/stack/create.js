const {flags} = require('@oclif/command')
const {cli} = require('cli-ux')
const inquirer = require('inquirer')

const BaseCommand = require('../base')
const {buildConfig} = require('../../lib/task-actions')
const {runTask} = require('../../lib/task-runner')
const logger = require('../../lib/logger')
const {stackTemplateData} = require('../../lib/config/templates/stacks')
const emptyStackData = require('../../lib/config/templates/stacks/empty').data
const {createStackConfigFromTemplate} = require('../../lib/config/initializer')
const {validateStackName} = require('../../lib/config/validator')
const PenguinError = require('../../lib/error/penguin-error')
const paths = require('../../lib/paths')


class CreateCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(CreateCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx)
      },
      {
        action: async ctx => {
          const stackName = flags['stack-name'] ?
            flags['stack-name'] :
            await cli.prompt('What do you want the name of your stack to be?')

          const validation = validateStackName(stackName)

          if (!validation.isValid) throw new PenguinError(validation.message)

          if (flags['empty']) {
            this.addStack(stackName)
          } else if (flags['template-name']) {
            this.addStack(stackName, flags['template-name'])
          } else {
              const noTemplateChoice = 'no template'

              const response = await inquirer.prompt([{
                name: 'template',
                message: 'What default stack template do you want to use?',
                type: 'list',
                choices: [noTemplateChoice].concat(stackTemplateData.map(d => d.name)),
              }])

            const stackTemplate = response.template === noTemplateChoice ? null : response.template

            this.addStack(stackName, stackTemplate)
          }
        }
      }
    ]

    await runTask(tasks)
  }

  addStack(stackName, templateName = null) {
    const hostPath = paths.relativePath(process.cwd()).join('/')

    if (templateName) {
      const template = stackTemplateData.find(t => t.name === templateName)

      createStackConfigFromTemplate(stackName, hostPath, template)

      logger.info(`New stack "${stackName}" was created in "${hostPath}"`)
    } else {
      createStackConfigFromTemplate(stackName, hostPath, emptyStackData)

      logger.info(`New empty stack "${stackName}" was created in "${hostPath}"`)
    }
  }
}

CreateCommand.description = `Creates a new stack.`

CreateCommand.flags = {
  'stack-name': flags.string({
    description: `Name for the new stack.`
  }),
  'empty': flags.boolean({
    description: `Create an empty stack.`
  }),
  'template-name': flags.string({
    description: `Create a stack from a default template.`
  }),
}

CreateCommand.hidden = false

module.exports = CreateCommand
