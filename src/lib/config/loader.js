const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

const containerTemplate = require('./container-template')
const yamlName = '.voila.yml'

const loadConfig = () => {
  let result = null
  let pathToYaml = process.cwd().split('/')

  while (pathToYaml.length > 0) {
    const fp = fullPath(pathToYaml.join('/'))

    if (fs.existsSync(fp)) {
      result =  yaml.safeLoad(fs.readFileSync(fp, 'utf8'))
      break;
    } else {
      pathToYaml.pop()
    }
  }

  if (result) {
    return result
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

const fullPath = path => {
  return `${path}/${yamlName}`
}

module.exports = {
  yamlName,
  loadConfig,
  generateConfig
}
