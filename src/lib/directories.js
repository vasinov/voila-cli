const {fullPathToConfig} = require('../lib/config/loader')

const projectHostDir = () => {
  return fullPathToConfig()
}


const moduleHostDir = module => {
  return module.hostDir
}

const moduleContainerDir = module => {
  return module.dockerfileData.find((e) => Object.keys(e)[0] === 'working_dir')['working_dir']
}

const relativeModuleDir = module => {
  const absoluteHostDir = process.cwd().split('/')
  const relativeHostDir = absoluteHostDir.slice(
    moduleHostDir(module).split('/').length,
    absoluteHostDir.length
  )

  return moduleContainerDir(module).split('/').concat(relativeHostDir).join('/')
}

module.exports = {
  projectHostDir,
  moduleContainerDir,
  moduleHostDir,
  relativeModuleDir
}
