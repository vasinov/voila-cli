const {loadUserConfig} = require('../../lib/config/loader')
const errorMessages = require('../../lib/error/messages')

exports.validateStackName = name => {
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return {
      isValid: false,
      message: errorMessages.STACK_NAME_INVALID
    }
  } else if(stackNameExists(name)) {
    return {
      isValid: false,
      message: errorMessages.STACK_NAME_EXISTS
    }
  } else {
    return {
      isValid: true,
      message: ``
    }
  }
}

const stackNameExists = name => {
  return loadUserConfig().config.stacks.map(s => s.name).includes(name)
}
