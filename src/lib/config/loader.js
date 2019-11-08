const yaml = require('js-yaml')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')
const {projectTemplate} = require('./templates/project')
const {moduleTemplate} = require('./templates/module')

exports.configFolderName = '.voila'
exports.modulesFolderName = 'modules'
exports.projectConfigFileName = 'config.yml'

exports.loadConfig = () => {
  let config = null
  const currentPath = process.cwd().split('/')
  const allPaths = []

  while (currentPath.length > 0) {
    const fp = this.prefixConfigFolder(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      allPaths.push(currentPath.join('/'))
      const projectConfigPath = path.join(fp, this.projectConfigFileName)
      const modulesPath = path.join(fp, this.modulesFolderName)

      const projectConfig = yaml.safeLoad(fs.readFileSync(projectConfigPath, 'utf8'))

      const modules = fs.readdirSync(modulesPath).map(file => {
        const pathToFile = path.join(modulesPath, file)

        return yaml.safeLoad(fs.readFileSync(pathToFile, 'utf8'))
      })

      config = {
        id: projectConfig.id,
        modules: modules
      }
    }

    currentPath.pop()
  }

  if (config) {
    const message = (allPaths.length > 1) ?
      errorMessages.multipleConfigsWarning(allPaths, this.prefixConfigFolder(allPaths[allPaths.length - 1])) :
      null

    return [message, config]
  } else {
    throw new VoilaError(errorMessages.NO_VOILA_YML)
  }
}

exports.generateProjectConfig = () => {
  return projectTemplate(crypto.randomBytes(5).toString('hex'))
}

exports.generateModuleConfig = (name, images) => {
  return moduleTemplate(name, images)
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
