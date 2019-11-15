const BaseCommand = require('../base')
const runTask = require('../../lib/run-task')
const PenguinError = require('../../lib/error/penguin-error')
const errorMessages = require('../../lib/error/messages')

class SetCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(SetCommand)

    const tasks = [
      {
        action: ctx => {
          if (this.storage.get('settings', args['key'])) {
            this.storage.set('settings', args['key'], args['value'])
          } else {
            throw new PenguinError(errorMessages.STORAGE_SETTINGS_KEY_DOESNT_EXIST)
          }
        }
      }
    ]

    await runTask(tasks)
  }
}

SetCommand.description = `Set a Penguin setting.`

SetCommand.args = [
  {
    name: 'key',
    required: true,
    description: 'Name of the setting.'
  },
  {
    name: 'value',
    required: true,
    description: 'New value of the setting.'
  }
]

module.exports = SetCommand
