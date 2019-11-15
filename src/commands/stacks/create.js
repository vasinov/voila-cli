const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux')
const inquirer = require('inquirer')

const {buildConfig} = require('../../lib/task-actions')
const runTask = require('../../lib/run-task')
const logger = require('../../lib/logger')
const {stackTemplateData} = require('../../lib/config/templates/stacks')
const emptyStackData = require('../../lib/config/templates/stacks/empty').data
const {createStackConfigFromTemplate} = require('../../lib/config/initializer')
const {validateStackName} = require('../../lib/config/validator')
const PenguinError = require('../../lib/error/penguin-error')
const paths = require('../../lib/paths')


class CreateCommand extends Command {
  async run() {
    const {flags, args} = this.parse(CreateCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: async ctx => {
          const stackName = args['stack-name'] ?
            args['stack-name'] :
            await cli.prompt('What do you want the name of your stack to be?')

          const validation = validateStackName(stackName)

          if (!validation.isValid) throw new PenguinError(validation.message)

          if (flags['empty']) {
            CreateCommand.addStack(stackName)
          } else if (flags['template-name']) {
            CreateCommand.addStack(stackName, flags['template-name'])
          } else {
              const noTemplateChoice = 'no template'

              const response = await inquirer.prompt([{
                name: 'template',
                message: 'What default stack template do you want to use?',
                type: 'list',
                choices: [noTemplateChoice].concat(stackTemplateData.map(d => d.name)),
              }])

            const stackTemplate = response.template === noTemplateChoice ? null : response.template

            CreateCommand.addStack(stackName, stackTemplate)
          }
        }
      }
    ]

    await runTask(tasks)
  }

  static addStack(stackName, templateName = null) {
    const hostDir = paths.relativePath(process.cwd()).join('/')

    if (templateName) {
      const template = stackTemplateData.find(t => t.name === templateName)

      createStackConfigFromTemplate(stackName, hostDir, template)

      logger.info(`New stack "${stackName}" was created in "${hostDir}"`)
    } else {
      createStackConfigFromTemplate(stackName, hostDir, emptyStackData)

      logger.info(`New empty stack "${stackName}" was created in "${hostDir}"`)
    }
  }
}

CreateCommand.description = `Creates a new stack.`

CreateCommand.args = [
  {
    name: 'stack-name',
    required: false,
    description: 'Name for the new stack.'
  }
]

CreateCommand.flags = {
  'empty': flags.boolean({
    description: `Create an empty stack.`
  }),
  'template-name': flags.string({
    description: `Create a stack from a default template.`
  }),
}

module.exports = CreateCommand
