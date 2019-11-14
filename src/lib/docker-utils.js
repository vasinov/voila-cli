const {spawn, spawnSync, exec, execSync} = require('child_process')

const VoilaError = require('../lib/error/voila-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

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

exports.isContainerRunning = containerName => {
  const args = ['container', 'ls', '--format', '{{json .Names }}']

  return runCommand('docker', args, {}, result => {
    const containerNames = result.split('\n').map(n => n.slice(1, -1))

    return containerNames.includes(containerName)
  })
}

exports.containerStatus = (containerName) => {
  if (this.isContainerRunning(containerName)) {
    return 'running'
  } else {
    return 'stopped'
  }
}

exports.startContainer = (stack, containerName, imageName, persistAfterStop, entrypointCommand = null) => {
  const args = ['run']

  if (!persistAfterStop) args.push('--rm')

  if (entrypointCommand) args.push('-it')
  else args.push('-dt')

  stack.volumes.forEach(v => args.push(`--volume=${v}`))

  stack.ports.forEach(p => args.push(`--publish=${p}`))

  stack.env.forEach(e => args.push(`--env=${e}`))

  args.push(`--name=${containerName}`)

  if (entrypointCommand) args.push('--entrypoint=bash')

  args.push(imageName)

  if (entrypointCommand) args.push('-c', entrypointCommand)

  return runCommand('docker', args, { stdio: entrypointCommand ? 'inherit' : 'pipe' }, result => result)
}

exports.stopContainer = (localdir, containerName) => {
  const args = ['container', 'stop', containerName]

  return runCommand('docker', args, {}, result => result)
}

exports.execCommandSync = (containerName, workdir, command) => {
  const args = ['exec', '-it', '-w', workdir, containerName, 'bash', '-c', command]

  return runCommand('docker', args, { stdio: 'inherit' }, result => result)
}

exports.execCommandAsync = (containerName, workdir, command) => {
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

  const subProcess = spawn('docker', args, { stdio: 'inherit' })

  subProcess.on('exit', code => {
    if (code !== 0) logger.error(errorMessages.SSH_SESSION_INTERRUPTED)
  })

  return subProcess
}

runCommand = (command, args, options, action) => {
  const result = spawnSync(command, args, options)

  if (result.stderr && result.stderr.length > 0) {
    throw new VoilaError(result.stderr)
  } else if (result.stdout) {
    return action(result.stdout.toString())
  } else {
    // this will only happen when stdio is set to "inherit"
    return null
  }
}
