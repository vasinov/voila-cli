const generator = require('dockerfile-generator/lib/dockerGenerator')
const Validator = require('jsonschema').Validator
var { parseArgsStringToArgv } = require('string-argv')

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
      dockerfileData.push({ working_dir: container.workdir })

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
        container.volumes.forEach(v => {
          volumes.push(`${Object.keys(v)[0]}:${Object.values(v)[0]}`)
        })
      }

      if (container.ports) container.ports.forEach(p => ports.push(p))

      return {
        name: container.name,
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

  getValue(containerName, key) {
    const obj = this.containers
      .find((c) => c.name === containerName).dockerfileData
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
