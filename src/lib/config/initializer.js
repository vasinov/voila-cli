const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const {
  prefixConfigFolder, configFolderName, stacksFolderName, projectConfigFileName,
  generateProjectConfig, generateStackConfig} = require('../config/loader')
const {stacksData} = require('./templates/stacks')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.init = (force) => {
  let folderExistsInParents = false
  const currentPath = process.cwd().split('/')

  currentPath.pop()

  while (currentPath.length > 0) {
    const fp = prefixConfigFolder(currentPath.join('/'))

    if (fs.existsSync(fp)) {
      folderExistsInParents = true
      break;
    } else {
      currentPath.pop()
    }
  }

  if (folderExistsInParents) {
    throw new VoilaError(errorMessages.configExistsInParentError(currentPath.join('/')))
  } else {
    if (fs.existsSync(configFolderName) && !force) {
      throw new VoilaError(errorMessages.VOILA_YML_ALREADY_EXISTS)
    } else {
      const stacksFolderPath = path.join(configFolderName, stacksFolderName)
      removeDirectory(configFolderName)

      fs.mkdirSync(configFolderName)
      fs.mkdirSync(stacksFolderPath)

      createConfigFiles()
    }
  }
}

const createConfigFiles = () => {
  const projectConfigPath = path.join(configFolderName, projectConfigFileName)

  fs.writeFileSync(projectConfigPath, yaml.safeDump(generateProjectConfig()), (err) => {
    throw new Error(err.message)
  })

  stacksData.forEach(stack => {
    const yamlPath = path.join(configFolderName, stacksFolderName, `${stack.name}.yml`)

    fs.writeFileSync(yamlPath, yaml.safeDump(generateStackConfig(stack.name, stack.images)), (err) => {
      throw new Error(err.message)
    })
  })
}

const removeDirectory = dirPath => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const filePath = path.join(dirPath, file)

      if (fs.lstatSync(filePath).isDirectory()) {
        removeDirectory(filePath)
      } else {
        fs.unlinkSync(filePath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}
