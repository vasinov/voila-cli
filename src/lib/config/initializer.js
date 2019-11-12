const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const crypto = require('crypto')

const {projectTemplate} = require('./templates/project')
const {stackTemplate} = require('./templates/stack')
const {prefixConfigDir, configDirName, stacksDirName, projectConfigFileName} = require('../config/loader')
const {stackTemplateData} = require('./templates/stacks')
const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')

exports.init = force => {
  let folderExistsInParents = false
  const currentPath = process.cwd().split('/')

  currentPath.pop()

  while (currentPath.length > 0) {
    const configDir = prefixConfigDir(currentPath.join('/'))

    if (fs.existsSync(configDir)) {
      folderExistsInParents = true
      break;
    } else {
      currentPath.pop()
    }
  }

  if (folderExistsInParents) {
    throw new VoilaError(errorMessages.configExistsInParentError(currentPath.join('/')))
  } else {
    if (fs.existsSync(configDirName) && !force) {
      throw new VoilaError(errorMessages.VOILA_YML_ALREADY_EXISTS)
    } else {
      const stacksFolderPath = path.join(configDirName, stacksDirName)
      removeDirectory(configDirName)

      fs.mkdirSync(configDirName)
      fs.mkdirSync(stacksFolderPath)

      createConfigFiles()
    }
  }
}

exports.createModuleConfigFromTemplate = (template, fileName) => {
  const yamlPath = path.join(configDirName, stacksDirName, `${fileName}.yml`)

  fs.writeFileSync(yamlPath, yaml.safeDump(generateStackConfig(template.name, template.images)), err => {
    throw new Error(err.message)
  })
}

const createConfigFiles = () => {
  createProjectConfig()

  stackTemplateData.forEach(template => this.createModuleConfigFromTemplate(template, template.name))
}

const createProjectConfig = () => {
  const projectConfigPath = path.join(configDirName, projectConfigFileName)

  fs.writeFileSync(projectConfigPath, yaml.safeDump(generateProjectConfig()), err => {
    throw new Error(err.message)
  })
}

const generateProjectConfig = () => {
  return projectTemplate(crypto.randomBytes(5).toString('hex'))
}

const generateStackConfig = (name, images) => {
  return stackTemplate(name, images)
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
