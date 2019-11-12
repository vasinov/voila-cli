const {spawn, spawnSync, exec, execSync} = require('child_process')

const defaultTag = "latest"

exports.containerName = (projectName, dockerfileName) => {
  return `voila-${projectName}-${dockerfileName}`
}

exports.imageNameWithTag = (projectName, dockerfileName, tag) => {
  return `voila-${projectName}-${dockerfileName}:${tag}`
}

exports.imageName = (projectName, dockerfileName) => {
  return this.imageNameWithTag(projectName, dockerfileName, defaultTag)
}

exports.isContainerRunning = (containerName) => {
  const containerNames =
    execSync(`docker container ls --format "{{json .Names }}"`)
      .toString()
      .split('\n').map(n => n.slice(1, -1))

  return containerNames.includes(containerName)
}

exports.containerStatus = (containerName) => {
  if (this.isContainerRunning(containerName)) {
    return 'running'
  } else {
    return 'stopped'
  }
}

exports.startContainer = (volumes, ports, containerName, imageName, isAttached, persistAfterStop) => {
  const args = ['run']

  if (!persistAfterStop) args.push('--rm')

  if (isAttached) args.push('-t')
  else args.push('-dt')

  volumes.forEach(v => {
    args.push(`--volume=${v}`)
  })

  ports.forEach(p => {
    args.push(`--publish=${p}`)
  })

  args.push(`--name=${containerName}`)
  args.push(imageName)

  return spawnSync('docker', args, {
    stdio: isAttached ? 'inherit' : 'pipe'
  })
}

exports.stopContainer = (localdir, workdir, containerName) => {
  const args = ['container', 'stop', containerName]

  spawnSync('docker', args)
}

exports.runCommand = (containerName, workdir, command) => {
  const args = ['exec', '-it', '-w', workdir, containerName, 'bash', '-c', command]

  return spawn('docker', args, { stdio: 'inherit' })
}

exports.runCommandAsync = (containerName, workdir, command) => {
  const args = ['exec', '-d', '-w', workdir, containerName, 'bash', '-c', command]

  return spawn('docker', args)
}

exports.buildImage = (imageName, dockerfile, isNoCache, isPull, isVerbose) => {
  const noCache = (isNoCache) ? '--no-cache' : ''
  const pull = (isPull) ? '--pull' : ''

  return execSync(`docker build ${noCache} ${pull} -t ${imageName} -f- . <<EOF\n${dockerfile}\nEOF`, {
    stdio: isVerbose ? 'inherit' : 'pipe'
  })
}

exports.sshContainer = (containerName, workdir) => {
  const args = ['exec', '-it', '-w', workdir, containerName, 'bash']

  return spawn('docker', args, { stdio: 'inherit' })
}
