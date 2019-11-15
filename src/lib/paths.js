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

exports.stackHostPath = stack => stack.hostDir.split('/')

exports.relativeStackPath = stack => {
  const absoluteHostDir = process.cwd().split('/')
  const relativeHostDir = absoluteHostDir.slice(
    this.stackHostPath(stack).length,
    absoluteHostDir.length
  )

  return stack.containerDir.split('/').concat(relativeHostDir)
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

exports.relativePath = p => {
  const relativePath = path.relative(this.projectHostPath().join('/'), p)

  return (relativePath) ? relativePath.split('/') : '.'.split('/')
}

exports.isAbsolute = p => path.isAbsolute(p)
