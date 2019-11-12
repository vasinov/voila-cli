const yaml = require('js-yaml')
const fs = require('fs')

const path = require('path')

const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.configDirName = '.voila'
exports.stacksDirName = 'stacks'
exports.projectConfigFileName = 'config.yml'
exports.stackFileExtension = '.yml'

exports.loadUserConfig = () => {
  let userConfig = null
  const currentPath = process.cwd().split('/')
  const allPaths = []

  while (currentPath.length > 0) {
    const fp = this.prefixConfigFolder(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      allPaths.push(currentPath.join('/'))
      const projectConfigPath = path.join(fp, this.projectConfigFileName)
      const stacksPath = path.join(fp, this.stacksDirName)

      const projectConfig = yaml.safeLoad(fs.readFileSync(projectConfigPath, 'utf8'))

      const stackConfigs = fs.readdirSync(stacksPath)
        .filter(file => file.endsWith(this.stackFileExtension))
        .map(file => yaml.safeLoad(fs.readFileSync(path.join(stacksPath, file), 'utf8')))

      userConfig = Object.assign(
        projectConfig,
        { stacks: stackConfigs }
      )
    }

    currentPath.pop()
  }

  if (userConfig) {
    const message = (allPaths.length > 1) ?
      errorMessages.multipleConfigsWarning(allPaths, this.prefixConfigFolder(allPaths[allPaths.length - 1])) :
      null

    return [message, userConfig]
  } else {
    throw new VoilaError(errorMessages.NO_VOILA_YML)
  }
}

exports.prefixConfigFolder = path => {
  return `${path}/${this.configDirName}`
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
