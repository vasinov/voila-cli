const Validator = require('jsonschema').Validator
const fs = require('fs')
const generator = require('dockerfile-generator/lib/dockerGenerator')

const CliError = require('../error/cli-error')
const errorMessages = require('../error/messages')
const paths = require('../paths')

module.exports = class Project {
  constructor(configFile) {
    Project.validate(configFile)

    this.id = configFile.id
    this.stacks = Project.parseStacks(configFile.stacks)
  }

  static validateHostVolumePath = (hostPath, allowOutsideProject) => {
    const absoluteHostPath = paths.toAbsolutePath(hostPath)

    if (allowOutsideProject || paths.doesPathContain(absoluteHostPath, paths.absoluteProjectHostPath())) {
      return absoluteHostPath.join('/')
    } else {
      throw new CliError(errorMessages.HOST_DIR_OUTSIDE_PROJECT)
    }
  }

  static validateStackVolumePath = (stackPath, volumes) => {
    const volumeStackPaths = volumes.map(v => {
      const segments = v.split(':')

      return segments[segments.length - 1].split('/')
    })

    if (!paths.isAbsolute(stackPath)) {
      throw new CliError(errorMessages.STACK_PATH_NOT_ABSOLUTE)
    } else if (paths.doesPathContainPaths(stackPath.split('/'), volumeStackPaths)) {
      throw new CliError(errorMessages.VOLUME_STACK_PATH_INSIDE_STACK_PATH)
    } else {
      return stackPath
    }
  }

  static readDockerfilePath = dockerfile => {
    if (dockerfile) {
      const absoluteDockerfilePath = paths.toAbsolutePath(dockerfile)

      if (paths.doesPathContain(absoluteDockerfilePath, paths.absoluteProjectHostPath())) {
        return absoluteDockerfilePath
      } else {
        throw new CliError(errorMessages.DOCKERFILE_OUTSIDE_PROJECT)
      }
    } else {
      return null
    }
  }

  static parseStacks(stacks) {
    return stacks.map(stack => {
      const dockerfilePath = Project.readDockerfilePath(stack.stages.build.dockerfile)
      const volumes = []
      const hostPath = Project.validateHostVolumePath(stack.stages.run.hostPath, false)
      const stackPath = Project.validateStackVolumePath(stack.stages.run.stackPath, volumes)

      let dockerfile = ''

      volumes.push(`${hostPath}:${stackPath}`)

      if (stack.stages.run.volumes) {
        stack.stages.run.volumes.forEach(volume => {
          const volumeHostPath = Project.validateHostVolumePath(volume.hostPath, true)
          const volumeStackPath = Project.validateStackVolumePath(volume.stackPath, volumes)

          volumes.push(`${volumeHostPath}:${volumeStackPath}`)
        })
      }

      if (dockerfilePath) {
        const dockerfileDir = dockerfilePath.join('/')

        if (fs.existsSync(dockerfileDir)) {
          dockerfile = fs.readFileSync(dockerfileDir, 'utf8')
        } else {
          throw new CliError(errorMessages.DOCKERFILE_DOESNT_EXIST)
        }
      } else {
        const dockerfileArray = []

        dockerfileArray.push({ from: stack.stages.build.image })

        dockerfileArray.push({ working_dir: stackPath })

        if (stack.stages.build.actions) {
          stack.stages.build.actions.forEach(action => {
            switch (Object.keys(action)[0]) {
              case "run":
                switch (typeof action.run) {
                  case "string":
                    dockerfileArray.push({ run: ["bash", "-c", action.run] })
                    break
                  case "object":
                    const run = action.run.join(' && ')

                    dockerfileArray.push({ run: ["bash", "-c", run] })
                    break
                }
                break
              default:
            }
          })
        }

        dockerfile = generator.generateDockerFileFromArray(dockerfileArray)
      }

      return {
        name: stack.name,
        configFile: stack.configFile,
        hostPath: hostPath,
        stackPath: stackPath,
        volumes: volumes,
        ports: stack.stages.run.ports || [],
        hardware: stack.stages.run.hardware || {},
        env: stack.stages.run.env || [],
        dockerfile: dockerfile,
        runCommands: stack.stages.run.commands || []
      }
    })
  }

  static validate(config) {
    const validator = new Validator()
    const {schema} = require('./schema')

    validator.validate(config, schema, { throwError: true })

    return config
  }

  stack(stackName) {
    const stack = this.stacks.find((c) => c.name === stackName)

    if (stack) {
      return stack
    } else {
      throw new CliError(errorMessages.STACK_NOT_FOUND)
    }
  }
}
