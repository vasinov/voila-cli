const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

const containerTemplate = require('./container-template')
const yamlConfigPath = './.voila.yml'

const loadConfig = () => {
  if (fs.existsSync(yamlConfigPath)) {
    return yaml.safeLoad(fs.readFileSync(yamlConfigPath, 'utf8'))
  } else {
    throw new VoilaError(errorMessages.NO_VOILA_YML)
  }
}

const generateConfig = () => {
  const randomId = crypto.randomBytes(10).toString('hex')

  const json = { id: randomId, containers: [] }

  const containers = {
    containers: [ containerTemplate ]
  }

  return Object.assign(json, containers)
}

module.exports = {
  yamlConfigPath,
  loadConfig,
  generateConfig
}
