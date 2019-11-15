const {spawn, spawnSync, exec, execSync} = require('child_process')

const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')

class Docker {
  constructor(dockerPath) {
    this.dockerPath = dockerPath
  }

  containerName = (projectName, stackName) => {
    return `penguin-${projectName}-${stackName}`
  }

  imageNameWithTag = (projectName, stackName, tag) => {
    return `penguin-${projectName}-${stackName}:${tag}`
  }

  imageName = (projectName, dockerfileName) => {
    return this.imageNameWithTag(projectName, dockerfileName, Docker.defaultTag)
  }

  isContainerRunning = containerName => {
    const args = ['container', 'ls', '--format', '{{json .Names }}']

    return this.runCommand(this.dockerPath, args, {}, result => {
      const containerNames = result.split('\n').map(n => n.slice(1, -1))

      return containerNames.includes(containerName)
    })
  }

  containerStatus = containerName => {
    if (this.isContainerRunning(containerName)) {
      return 'running'
    } else {
      return 'stopped'
    }
  }

  startContainer = (stack, containerName, imageName, persistAfterStop, entrypointCommand = null) => {
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

    return this.runCommand(
      this.dockerPath, args, { stdio: entrypointCommand ? 'inherit' : 'pipe' }, result => result)
  }

  stopContainer = (localdir, containerName) => {
    const args = ['container', 'stop', containerName]

    return this.runCommand(this.dockerPath, args, {}, result => result)
  }

  execCommandSync = (containerName, workdir, command) => {
    const args = ['exec', '-it', '-w', workdir, containerName, 'bash', '-c', command]

    return this.runCommand(this.dockerPath, args, { stdio: 'inherit' }, result => result)
  }

  execCommandAsync = (containerName, workdir, command) => {
    const pathToJobs = `/penguin/jobs/output`
    const commandWithPipe = `mkdir -p ${pathToJobs} && ${command} > ${pathToJobs}/job-output`

    const args = ['exec', '-d', '-w', workdir, containerName, 'bash', '-c', commandWithPipe]

    return spawn(this.dockerPath, args)
  }

  buildImage = (imageName, dockerfile, isNoCache, isPull, isVerbose) => {
    const noCache = (isNoCache) ? '--no-cache' : ''
    const pull = (isPull) ? '--pull' : ''

    return execSync(
      `${this.dockerPath} build ${noCache} ${pull} -t ${imageName} -f- . <<EOF\n${dockerfile}\nEOF`, {
      stdio: isVerbose ? 'inherit' : 'pipe'
    })
  }

  sshContainer = (containerName, workdir) => {
    const args = ['exec', '-it', '-w', workdir, containerName, 'bash']

    const subProcess = spawn(this.dockerPath, args, { stdio: 'inherit' })

    subProcess.on('exit', code => {
      if (code !== 0) logger.error(errorMessages.SSH_SESSION_INTERRUPTED)
    })

    return subProcess
  }

  runCommand = (command, args, options, action) => {
    const result = spawnSync(command, args, options)

    if (result.stderr && result.stderr.length > 0) {
      throw new PenguinError(result.stderr)
    } else if (result.error) {
      throw new PenguinError(result.error)
    } else if (result.stdout) {
      return action(result.stdout.toString())
    } else {
      // this will only happen when stdio is set to "inherit"
      return null
    }
  }
}

Docker.defaultTag = 'latest'

module.exports = Docker
