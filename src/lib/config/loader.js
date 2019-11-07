const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

const containerTemplate = require('./container-template')

exports.yamlName = '.voila.yml'

exports.loadConfig = () => {
  let config = null
  const currentPath = process.cwd().split('/')
  const allPaths = []

  while (currentPath.length > 0) {
    const fp = this.prefixYamlFile(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      allPaths.push(currentPath.join('/'))

      config = yaml.safeLoad(fs.readFileSync(fp, 'utf8'))
    }

    currentPath.pop()
  }

  if (config) {
    const message = (allPaths.length > 1) ?
      errorMessages.multipleConfigsWarning(allPaths, this.prefixYamlFile(allPaths[allPaths.length - 1])) :
      null

    return [message, config]
  } else {
    throw new VoilaError(errorMessages.NO_VOILA_YML)
  }
}

exports.generateConfig = () => {
  const randomId = crypto.randomBytes(10).toString('hex')

  const json = { id: randomId, containers: [] }

  const containers = {
    containers: [ containerTemplate ]
  }

  return Object.assign(json, containers)
}

exports.prefixYamlFile = path => {
  return `${path}/${this.yamlName}`
}

exports.fullPathToConfig = () => {
  let finalPath = null
  let currentPath = process.cwd().split('/')

  while (currentPath.length > 0) {
    const currentPathString = currentPath.join('/')

    if (fs.existsSync(this.prefixYamlFile(currentPathString))) {
      finalPath = currentPathString
    }

    currentPath.pop()
  }

  return finalPath
}
