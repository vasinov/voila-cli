const {fullPathToConfig} = require('../lib/config/loader')

exports.projectHostDirPath = () => {
  return fullPathToConfig().split('/')
}

exports.moduleHostPath = module => {
  return module.hostDir.split('/')
}

exports.moduleContainerPath = module => {
  return module.dockerfileData
    .find((e) => Object.keys(e)[0] === 'working_dir')['working_dir']
    .split('/')
}

exports.relativeModulePath = module => {
  const absoluteHostDir = process.cwd().split('/')
  const relativeHostDir = absoluteHostDir.slice(
    this.moduleHostPath(module).length,
    absoluteHostDir.length
  )

  return this.moduleContainerPath(module).concat(relativeHostDir)
}

exports.doesPathIncludePath = (path1, path2) => {
  if (path2.length < path1.length) {
    return false
  } else {
    return path1.every((segment, index) => {
      return segment === path2[index]
    })
  }
}

exports.doesPathIncludeCurrentPath = path => {
  return this.doesPathIncludePath(path, process.cwd().split('/'))
}
