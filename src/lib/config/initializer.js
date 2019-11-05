const fs = require('fs')
const yaml = require('js-yaml')

const configLoader = require('../config/loader')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

const init = (force) => {
  let fileExistsInParents = false
  const currentPath = process.cwd().split('/')

  currentPath.pop()

  while (currentPath.length > 0) {
    const fp = configLoader.prefixYamlFile(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      fileExistsInParents = true
      break;
    } else {
      currentPath.pop()
    }
  }

  if (fileExistsInParents) {
    throw new VoilaError(errorMessages.configExistsInParentError(currentPath.join('/')))
  } else {
    if (fs.existsSync(configLoader.prefixYamlFile('.')) && !force) {
      throw new VoilaError(errorMessages.VOILA_YML_ALREADY_EXISTS)
    } else {
      fs.writeFileSync(configLoader.yamlName, yaml.safeDump(configLoader.generateConfig()), (err) => {
        throw new Error(err.message)
      })
    }
  }
}

module.exports = {
  init
}
