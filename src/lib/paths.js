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

exports.doesPath1ContainPath2 = (path1, path2) => {
  if (path1.length < path2.length) {
    return false
  } else {
    return path2.every((segment, index) => {
      return segment === path1[index]
    })
  }
}

exports.doesPathContainCurrentPath = path => {
  return this.doesPath1ContainPath2(path, process.cwd().split('/'))
}

exports.doesCurrentPathContainPath = path => {
  return this.doesPath1ContainPath2(process.cwd().split('/'), path)
}
