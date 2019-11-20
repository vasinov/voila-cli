const {prefixConfigDir} = require('./config/loader')

const fs = require('fs')
const path = require('path')

exports.absoluteProjectHostPath = () => {
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

exports.relativeStackHostPath = stack => stack.hostPath.split('/')

exports.hostToStackAbsolutePath = stack => {
  const absoluteHostDir = process.cwd().split('/')
  const relativeHostDir = absoluteHostDir.slice(
    this.relativeStackHostPath(stack).length,
    absoluteHostDir.length
  )

  return stack.stackPath.split('/').concat(relativeHostDir)
}

exports.doesPathContain = (p1, p2) => {
  if (p1.length < p2.length) {
    return false
  } else {
    return p2.every((segment, index) => {
      return segment === p1[index]
    })
  }
}

exports.doesPathContainCurrentPath = p => {
  return this.doesPathContain(p, process.cwd().split('/'))
}

exports.doesCurrentPathContain = p => {
  return this.doesPathContain(process.cwd().split('/'), p)
}

exports.toAbsolutePath = p => {
  if (this.isAbsolute(p)) {
    return p.split('/')
  } else {
    return path.join(this.absoluteProjectHostPath().join('/'), p).split('/')
  }
}

exports.relativePath = p => {
  const relativePath = path.relative(this.absoluteProjectHostPath().join('/'), p)

  return (relativePath) ? relativePath.split('/') : '.'.split('/')
}

exports.isAbsolute = p => path.isAbsolute(p)
