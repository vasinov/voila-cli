const {flags} = require('@oclif/command')
const inquirer = require('inquirer')

const BaseCommand = require('./base')
const initializer = require('../lib/config/initializer')
const {runTask} = require('../lib/task-runner')
const logger = require('../lib/logger')
const {stackTemplateData} = require('../lib/config/templates/stacks')

class InitCommand extends BaseCommand {
  async run() {
    const {flags} = this.parse(InitCommand)

    const tasks = [
      {
        action: async () => {
          logger.infoWithTime('Generating new config files')

          if (flags['empty']) {
            initializer.init(flags.force, [])
          } else if (flags['all']) {
            initializer.init(flags.force, stackTemplateData)
          } else if (flags['template-name']) {
            const template = stackTemplateData.find(t => t.name === flags['template-name'])

            initializer.init(flags.force, [template])
          } else {
            const choices = ['none', 'all'].concat(stackTemplateData.map(t => { return {
              name: t.name
            }}))

            const response = await inquirer.prompt([{
              name: 'template',
              message: 'What default stack template do you want to use for your new project?',
              type: 'list',
              choices: choices,
            }])

            switch (response.template) {
              case 'none':
                initializer.init(flags.force, [])
                break
              case 'all':
                initializer.init(flags.force, stackTemplateData)
                break
              default:
                const template = stackTemplateData.find(t => t.name === response.template)

                initializer.init(flags.force, [template])
            }
          }

          logger.infoWithTime(
            `New ".penguin" folder with config files was created in the current directory.`, true)
        }
      }
    ]

    await runTask(tasks)
  }
}

InitCommand.description = `Initialize Penguin in the current directory. This command creates a ".penguin" folder with YAML config files.`

InitCommand.flags = {
  'force': flags.boolean({
    description: `Override an existing config folder.`,
  }),
  'empty': flags.boolean({
    description: `Create an empty project.`,
  }),
  'all': flags.boolean({
    description: `Create a project with all available stack templates.`,
  }),
  'template-name': flags.string({
    description: `Create a project with a specific stack template.`,
  })
}

InitCommand.hidden = false

module.exports = InitCommand
