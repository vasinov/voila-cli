const {fullPathToConfig} = require('../lib/config/loader')

exports.projectHostDirPath = () => {
  return fullPathToConfig().split('/')
}

exports.stackHostPath = stack => {
  return stack.hostDir.split('/')
}

exports.stackContainerPath = stack => {
  return stack.dockerfileData
    .find((e) => Object.keys(e)[0] === 'working_dir')['working_dir']
    .split('/')
}

exports.relativeStackPath = stack => {
  const absoluteHostDir = process.cwd().split('/')
  const relativeHostDir = absoluteHostDir.slice(
    this.stackHostPath(stack).length,
    absoluteHostDir.length
  )

  return this.stackContainerPath(stack).concat(relativeHostDir)
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
