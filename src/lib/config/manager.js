const generator = require('dockerfile-generator/lib/dockerGenerator')
const {fullPathToConfig} = require('../../lib/config/loader')

const Validator = require('jsonschema').Validator
const {parseArgsStringToArgv} = require('string-argv')

class Manager {
  constructor(config) {
    Manager.validate(config)

    this.id = config.id
    this.containers = Manager.configToJson(config)
  }

  static configToJson(config) {
    return config.containers.map(container => {
      const globalEnv = container.env
      const buildEnv = container.stages.build.env
      const buildStage = container.stages.build
      const runStage = container.stages.run
      const volumes = []
      const ports = []
      const dockerfileData = []

      buildStage.images.forEach(i => dockerfileData.push({
        from: i
      }))

      dockerfileData.push({ args: [] })
      dockerfileData.push({ env: {} })

      const [hostWorkdir, containerWorkdir] = (() => {
        switch (typeof container.workdir) {
          case 'string':
            dockerfileData.push({ working_dir: container.workdir })

            return [
              fullPathToConfig(),
              container.workdir
            ]
          case 'object':
            dockerfileData.push({ working_dir: Object.values(container.workdir)[0] })

            return [
              Object.keys(container.workdir)[0],
              Object.values(container.workdir)[0]
            ]
          default:
        }
      })()

      if (globalEnv) {
        globalEnv.forEach((c) => {
          const index = dockerfileData.findIndex((e) => Object.keys(e)[0] === 'env')

          dockerfileData[index]['env'][Object.keys(c)[0]] = Object.values(c)[0]
        })
      }

      if (buildEnv) {
        buildEnv.forEach(env => {
          const index = dockerfileData.findIndex((e) => Object.keys(e)[0] === 'args')

          dockerfileData[index]['args'].push(`${[Object.keys(env)[0]]}=${Object.values(env)[0]}`)
        })
      }

      if (buildStage.actions) {
        buildStage.actions.forEach(action => {
          switch (Object.keys(action)[0]) {
            case "execute":
              switch (typeof action.execute) {
                case 'string':
                  dockerfileData.push({ run: parseArgsStringToArgv(action.execute) })
                  break
                case 'object':
                  dockerfileData.push({ run: action.execute })
                  break
                default:
              }
              break
            default:
          }
        })
      }

      if (runStage && runStage.command) {
        dockerfileData.push({ cmd: runStage.command })
      }

      if (container.volumes) {
        container.volumes.forEach(volume => {
            switch (typeof volume) {
              case 'string':
                volumes.push(`${volume}:${volume}`)
                break
              case 'object':
                volumes.push(`${Object.keys(volume)[0]}:${Object.values(volume)[0]}`)
                break
              default:
            }
        })
      }

      volumes.push(`${hostWorkdir}:${containerWorkdir}`)

      if (container.ports) container.ports.forEach(p => ports.push(p))

      return {
        name: container.name,
        hostDir: hostWorkdir,
        volumes: volumes,
        ports: ports,
        dockerfileData: dockerfileData
      }
    })
  }

  static validate(config) {
    const validator = new Validator()
    const schema = require('./schema')

    validator.validate(config, schema, { throwError: true })

    return config
  }

  getModule(moduleName) {
    return this.containers.find((c) => c.name === moduleName)
  }

  findInDockerfileData(containerName, key) {
    const obj = this.containers
      .find((c) => c.name === containerName)
      .dockerfileData
      .find((e) => Object.keys(e)[0] === key)

    return obj ? obj[key]: null
  }

  toDockerfile(containerName) {
    return generator.generateDockerFileFromArray(
      this.containers.find((c) => c.name === containerName).dockerfileData
    )
  }
}

module.exports = Manager
