const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')
const {projectTemplate} = require('./templates/project')
const {stackTemplate} = require('./templates/stack')

exports.configFolderName = '.voila'
exports.stacksFolderName = 'stacks'
exports.projectConfigFileName = 'config.yml'
exports.stackFileExtension = '.yml'

exports.loadConfig = () => {
  let projectConfig = null
  const currentPath = process.cwd().split('/')
  const allPaths = []

  while (currentPath.length > 0) {
    const fp = this.prefixConfigFolder(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      allPaths.push(currentPath.join('/'))
      const projectConfigPath = path.join(fp, this.projectConfigFileName)
      const stacksPath = path.join(fp, this.stacksFolderName)

      const projectConfigPart = yaml.safeLoad(fs.readFileSync(projectConfigPath, 'utf8'))

      const stackConfigParts = fs.readdirSync(stacksPath)
        .filter(file => file.endsWith(this.stackFileExtension))
        .map(file => yaml.safeLoad(fs.readFileSync(path.join(stacksPath, file), 'utf8')))

      projectConfig = {
        id: projectConfigPart.id,
        stacks: stackConfigParts
      }
    }

    currentPath.pop()
  }

  if (projectConfig) {
    const message = (allPaths.length > 1) ?
      errorMessages.multipleConfigsWarning(allPaths, this.prefixConfigFolder(allPaths[allPaths.length - 1])) :
      null

    return [message, projectConfig]
  } else {
    throw new VoilaError(errorMessages.NO_VOILA_YML)
  }
}

exports.generateProjectConfig = () => {
  return projectTemplate(crypto.randomBytes(5).toString('hex'))
}

exports.generateStackConfig = (name, images) => {
  return stackTemplate(name, images)
}

exports.prefixConfigFolder = path => {
  return `${path}/${this.configFolderName}`
}

exports.fullPathToConfig = () => {
  let finalPath = null
  let currentPath = process.cwd().split('/')

  while (currentPath.length > 0) {
    const currentPathString = currentPath.join('/')

    if (fs.existsSync(this.prefixConfigFolder(currentPathString))) {
      finalPath = currentPathString
    }

    currentPath.pop()
  }

  return finalPath
}
