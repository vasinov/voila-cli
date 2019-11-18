const Validator = require('jsonschema').Validator
const fs = require('fs')
const generator = require('dockerfile-generator/lib/dockerGenerator')

const PenguinError = require('../error/penguin-error')
const errorMessages = require('../error/messages')
const paths = require('../paths')

module.exports = class Builder {
  constructor(configFile) {
    Builder.validate(configFile)

    this.projectId = configFile.id
    this.projectStacks = Builder.parseStacks(configFile.stacks)
  }

  static validateHostVolumeDir = hostDir => {
    const absoluteHostPath = paths.toAbsolutePath(hostDir)

    if (paths.doesPathContain(absoluteHostPath, paths.absoluteProjectHostPath())) {
      return absoluteHostPath.join('/')
    } else {
      throw new PenguinError(errorMessages.HOST_DIR_OUTSIDE_PROJECT)
    }
  }

  static validateContainerVolumeDir = containerDir => {
    if (paths.isAbsolute(containerDir)) {
      return containerDir
    } else {
      throw new PenguinError(errorMessages.CONTAINER_DIR_NOT_ABSOLUTE)
    }
  }

  static readDockerfilePath = dockerfile => {
    if (dockerfile) {
      const absoluteDockerfilePath = paths.toAbsolutePath(dockerfile)

      if (paths.doesPathContain(absoluteDockerfilePath, paths.absoluteProjectHostPath())) {
        return absoluteDockerfilePath
      } else {
        throw new PenguinError(errorMessages.DOCKERFILE_OUTSIDE_PROJECT)
      }
    } else {
      return null
    }
  }

  static parseStacks(stacks) {
    return stacks.map(stack => {
      const dockerfilePath = Builder.readDockerfilePath(stack.stages.build.dockerfile)
      const volumes = []
      const hostDir = Builder.validateHostVolumeDir(stack.stages.run.hostDir)
      const containerDir = Builder.validateContainerVolumeDir(stack.stages.run.containerDir)

      let dockerfile = ''

      if (stack.stages.run.volumes) {
        stack.stages.run.volumes.forEach(volume => {
          const volumeHostDir = Builder.validateHostVolumeDir(volume.hostDir)
          const volumeContainerDir = Builder.validateContainerVolumeDir(volume.containerDir)

          volumes.push(`${volumeHostDir}:${volumeContainerDir}`)
        })
      }

      volumes.push(`${hostDir}:${containerDir}`)

      if (dockerfilePath) {
        const dockerfileDir = dockerfilePath.join('/')

        if (fs.existsSync(dockerfileDir)) {
          dockerfile = fs.readFileSync(dockerfileDir, 'utf8')

          if (stack.stages.run.command) {
            dockerfile += `\nENTRYPOINT [ "bash", "-c", "${stack.stages.run.command}" ]`
          }
        } else {
          throw new PenguinError(errorMessages.DOCKERFILE_DOESNT_EXIST)
        }
      } else {
        const dockerfileArray = []

        stack.stages.build.images.forEach(i => dockerfileArray.push({
          from: i
        }))

        dockerfileArray.push({ working_dir: containerDir })

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
        hostDir: hostDir,
        containerDir: containerDir,
        volumes: volumes,
        ports: stack.stages.run.ports || [],
        hardware: stack.stages.run.hardware || {},
        env: stack.stages.run.env || [],
        dockerfile: dockerfile,
        entrypointCommand: stack.stages.run.command
      }
    })
  }

  static validate(config) {
    const validator = new Validator()
    const {schema} = require('./schema')

    validator.validate(config, schema, { throwError: true })

    return config
  }

  getStack(stackName) {
    const stack = this.projectStacks.find((c) => c.name === stackName)

    if (stack) {
      return stack
    } else {
      throw new PenguinError(errorMessages.STACK_NOT_FOUND)
    }
  }
}
