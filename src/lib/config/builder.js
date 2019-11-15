const Validator = require('jsonschema').Validator
const fs = require('fs')
const generator = require('dockerfile-generator/lib/dockerGenerator')

const VoilaError = require('../error/voila-error')
const errorMessages = require('../error/messages')
const paths = require('../paths')

module.exports = class Builder {
  constructor(configFile) {
    Builder.validate(configFile)

    this.projectId = configFile.id
    this.projectStacks = Builder.parseStacks(configFile.stacks)
  }

  static readHostDir = stack => {
    const absoluteHostPath = paths.toAbsolutePath(stack.stages.run.hostDir)

    if (paths.doesPath1ContainPath2(absoluteHostPath, paths.projectHostPath())) {
      return absoluteHostPath.join('/')
    } else {
      throw new VoilaError(errorMessages.HOST_DIR_OUTSIDE_PROJECT)
    }
  }

  static readContainerDir = stack => {
    if (paths.isAbsolute(stack.stages.run.containerDir)) {
      return stack.stages.run.containerDir
    } else {
      throw new VoilaError(errorMessages.CONTAINER_DIR_NOT_ABSOLUTE)
    }
  }

  static readDockerfilePath = dockerfile => {
    if (dockerfile) {
      const absoluteDockerfilePath = paths.toAbsolutePath(dockerfile)

      if (paths.doesPath1ContainPath2(absoluteDockerfilePath, paths.projectHostPath())) {
        return absoluteDockerfilePath
      } else {
        throw new VoilaError(errorMessages.DOCKERFILE_OUTSIDE_PROJECT)
      }
    } else {
      return null
    }
  }

  static parseStacks(stacks) {
    return stacks.map(stack => {
      const dockerfilePath = Builder.readDockerfilePath(stack.stages.build.dockerfile)
      const volumes = []
      const ports = []
      const hostDir = Builder.readHostDir(stack)
      const containerDir = Builder.readContainerDir(stack)

      let dockerfile = ''

      if (stack.stages.run.volumes) {
        stack.stages.run.volumes.forEach(volume => {
          switch (typeof volume) {
            case 'string':
              const dir = paths.toAbsolutePath(volume).join('/')

              volumes.push(`${dir}:${dir}`)
              break
            case 'object':
              const dir1 = paths.toAbsolutePath(Object.keys(volume)[0]).join('/')
              const dir2 = Object.values(volume)[0]

              volumes.push(`${dir1}:${dir2}`)
              break
            default:
          }
        })
      }

      volumes.push(`${hostDir}:${containerDir}`)

      if (stack.stages.run.ports) stack.stages.run.ports.forEach(p => ports.push(p))

      if (dockerfilePath) {
        const dockerfileDir = dockerfilePath.join('/')

        if (fs.existsSync(dockerfileDir)) {
          dockerfile = fs.readFileSync(dockerfileDir, 'utf8')

          if (stack.stages.run.command) {
            dockerfile += `\nENTRYPOINT [ "bash", "-c", "${stack.stages.run.command}" ]`
          }
        } else {
          throw new VoilaError(errorMessages.DOCKERFILE_DOESNT_EXIST)
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
        ports: ports,
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
      throw new VoilaError(errorMessages.STACK_NOT_FOUND)
    }
  }
}
