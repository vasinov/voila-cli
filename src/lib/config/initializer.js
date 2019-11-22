const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const crypto = require('crypto')

const {projectTemplate} = require('./templates/project')
const {stackTemplate} = require('./templates/stack')
const {prefixConfigDir, configDirName, stacksDirName, projectConfigFileName} = require('../config/loader')
const CliError = require('../error/cli-error')
const errorMessages = require('../error/messages')
const paths = require('../../lib/paths')

exports.init = (force, templates) => {
  let folderExistsInParents = false
  const currentPath = process.cwd().split('/')

  currentPath.pop()

  while (currentPath.length > 0) {
    const configDir = prefixConfigDir(currentPath.join('/'))

    if (fs.existsSync(configDir)) {
      folderExistsInParents = true
      break
    } else {
      currentPath.pop()
    }
  }

  if (folderExistsInParents) {
    throw new CliError(errorMessages.configExistsInParentError(currentPath.join('/')))
  } else {
    if (fs.existsSync(configDirName) && !force) {
      throw new CliError(errorMessages.CONFIG_ALREADY_EXISTS)
    } else {
      const stacksFolderPath = path.join(configDirName, stacksDirName)
      removeDirectory(configDirName)

      fs.mkdirSync(configDirName)
      fs.mkdirSync(stacksFolderPath)

      createConfigFiles(templates)
    }
  }
}

exports.createStackConfigFromTemplate = (stackName, hostPath, template) => {
  let suffix = ''
  let fileCreated = false

  while (!fileCreated) {
    const yamlPath = path.join(
      paths.absoluteProjectHostPath().join('/'), configDirName, stacksDirName, `${stackName}${suffix}.yml`
    )

    if (!fs.existsSync(yamlPath)) {
      fs.writeFileSync(yamlPath, yaml.safeDump(generateStackConfig(stackName, hostPath, template.image)))

      fileCreated = true
    } else {
      suffix = `-${crypto.randomBytes(2).toString('hex')}`
    }
  }
}

const createConfigFiles = (templates) => {
  createProjectConfig()

  templates.forEach(template => {
    this.createStackConfigFromTemplate(template.name, '.', template)
  })
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

const generateStackConfig = (name, hostPath, image) => {
  return stackTemplate(name, hostPath, image)
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
