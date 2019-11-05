const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

const containerTemplate = require('./container-template')
const yamlName = '.voila.yml'

const loadConfig = () => {
  let config = null
  let currentPath = process.cwd().split('/')
  const allPaths = []
  let message = null

  while (currentPath.length > 0) {
    const fp = fullPath(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      allPaths.push(currentPath.join('/'))

      config = yaml.safeLoad(fs.readFileSync(fp, 'utf8'))
    }

    currentPath.pop()
  }

  if (config) {
    if (allPaths.length > 1) {
      message = errorMessages.multipleConfigsWarning(allPaths, fullPath(allPaths[allPaths.length - 1]))
    }

    return [message, config]
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
  generateConfig,
  fullPath
}
