const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const {
  prefixConfigFolder, configFolderName, modulesFolderName, projectConfigFileName,
  generateProjectConfig, generateModuleConfig} = require('../config/loader')
const {modulesData} = require('./templates/modules')
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
      const modulesFolderPath = path.join(configFolderName, modulesFolderName)
      removeDirectory(configFolderName)

      fs.mkdirSync(configFolderName)
      fs.mkdirSync(modulesFolderPath)

      createConfigFiles()
    }
  }
}

const createConfigFiles = () => {
  const projectConfigPath = path.join(configFolderName, projectConfigFileName)

  fs.writeFileSync(projectConfigPath, yaml.safeDump(generateProjectConfig()), (err) => {
    throw new Error(err.message)
  })

  modulesData.forEach(module => {
    const yamlPath = path.join(configFolderName, modulesFolderName, `${module.name}.yml`)

    fs.writeFileSync(yamlPath, yaml.safeDump(generateModuleConfig(module.name, module.images)), (err) => {
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
