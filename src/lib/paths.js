const {prefixConfigDir} = require('./config/loader')

const fs = require('fs')
const path = require('path')

exports.projectHostPath = () => {
  let finalPath = null
  let currentPath = process.cwd().split('/')

  while (currentPath.length > 0) {
    const currentPathString = currentPath.join('/')

    if (fs.existsSync(prefixConfigDir(currentPathString))) {
      finalPath = currentPathString
    }

    currentPath.pop()
  }

  return finalPath.split('/')
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

exports.doesPath1ContainPath2 = (p1, p2) => {
  if (p1.length < p2.length) {
    return false
  } else {
    return p2.every((segment, index) => {
      return segment === p1[index]
    })
  }
}

exports.doesPathContainCurrentPath = p => {
  return this.doesPath1ContainPath2(p, process.cwd().split('/'))
}

exports.doesCurrentPathContainPath = p => {
  return this.doesPath1ContainPath2(process.cwd().split('/'), p)
}

exports.toAbsolutePath = p => {
  if (this.isAbsolute(p)) {
    return p.split('/')
  } else {
    return path.join(this.projectHostPath().join('/'), p).split('/')
  }
}

exports.isAbsolute = p => {
  return path.isAbsolute(p)
}
