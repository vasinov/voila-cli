const {spawn, spawnSync, exec, execSync} = require('child_process')

const PenguinError = require('../lib/error/penguin-error')
const errorMessages = require('../lib/error/messages')
const logger = require('../lib/logger')
const Job = require('../lib/job')
const {parseTable} = require('../lib/shell')

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

    return this.runCommandSync(this.dockerPath, args, {}, result => {
      const containerNames = result.split('\n').map(n => n.slice(1, -1))

      return containerNames.includes(containerName)
    })
  }

  containerStatus = containerName => this.isContainerRunning(containerName) ? 'running' : 'stopped'

  startContainer = (stack, containerName, imageName, persistAfterStop, entrypoint = null) => {
    const args = ['run']

    if (!persistAfterStop) args.push('--rm')

    if (entrypoint) args.push('-it')
    else args.push('-dt')

    stack.volumes.forEach(v => args.push(`--volume=${v}`))

    stack.ports.forEach(p => args.push(`--publish=${p}`))

    stack.env.forEach(e => args.push(`--env=${e}`))

    args.push(`--name=${containerName}`)

    if (entrypoint) args.push('--entrypoint=sh')

    args.push(imageName)

    if (entrypoint) args.push('-c', entrypoint)

    return this.runCommandSync(
      this.dockerPath, args, { stdio: entrypoint ? 'inherit' : 'pipe' }, result => result)
  }

  stopContainer = (localdir, containerName) => {
    const args = ['container', 'stop', containerName]

    return this.runCommandSync(this.dockerPath, args, {}, result => result)
  }

  execCommandSync = (containerName, workdir, command) => {
    const args = ['exec', '-it', '-w', workdir, containerName, 'sh', '-c', command]

    return this.runCommandSync(this.dockerPath, args, { stdio: 'inherit' }, result => result)
  }

  startJob = (containerName, workdir, job) => {
    const pathToJobs = Job.containerOutputPath

    const commandWithPipe = `mkdir -p ${pathToJobs} && ${job.command} > ${pathToJobs}/${job.id}`

    const args = ['exec', '-d', '-w', workdir, containerName, 'sh', '-c', commandWithPipe]

    return spawn(this.dockerPath, args)
  }

  killJob = (containerName, job, signal) => {
    const pid = this.ps(containerName).find(row => row['CMD'].includes(job.id))['PID']

    const args = ['exec', '-it', containerName, 'kill', `-${signal}`, `-${pid}`]
    const opts = { stdio: 'inherit' }

    return this.runCommandSync(this.dockerPath, args, opts, result => result)
  }

  isJobRunning = (containerName, jobId) => this.ps(containerName).find(row => row['CMD'].includes(jobId))

  ps = containerName => {
    const args = ['exec', '-it', containerName, 'ps', '-efww']
    const opts = { stdio: ['inherit', 'pipe', 'pipe'] }

    return parseTable(
      this.runCommandSync(this.dockerPath, args, opts, result => result)
    )
  }

  cat = (containerName, path) => {
    const args = ['exec', '-it', containerName, 'cat', path]
    const opts = { stdio: ['inherit', 'pipe', 'pipe'] }

    return this.runCommandSync(this.dockerPath, args, opts, result => result)
  }

  tail = (containerName, path) => {
    const args = ['exec', '-it', containerName, 'tail', '-f', path]
    const opts = { stdio: 'inherit' }

    return this.runCommandSync(this.dockerPath, args, opts, result => result)
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

  runCommandSync = (command, args, options, action) => {
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
