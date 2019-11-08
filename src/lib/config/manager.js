const generator = require('dockerfile-generator/lib/dockerGenerator')
const {fullPathToConfig} = require('../../lib/config/loader')

const Validator = require('jsonschema').Validator
const {parseArgsStringToArgv} = require('string-argv')

module.exports = class Manager {
  constructor(config) {
    Manager.validate(config)

    this.id = config.id
    this.defaultModuleName = config.defaultModuleName
    this.modules = Manager.parseModules(config.modules)
  }

  static parseModules(modules) {
    return modules.map(module => {
      const globalEnv = module.env
      const buildEnv = module.stages.build.env
      const buildStage = module.stages.build
      const runStage = module.stages.run
      const volumes = []
      const ports = []
      const dockerfileData = []

      buildStage.images.forEach(i => dockerfileData.push({
        from: i
      }))

      dockerfileData.push({ args: [] })
      dockerfileData.push({ env: {} })

      const [hostWorkdir, moduleWorkdir] = (() => {
        switch (typeof module.workdir) {
          case 'string':
            dockerfileData.push({ working_dir: module.workdir })

            return [
              fullPathToConfig(),
              module.workdir
            ]
          case 'object':
            dockerfileData.push({ working_dir: Object.values(module.workdir)[0] })

            return [
              Object.keys(module.workdir)[0],
              Object.values(module.workdir)[0]
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

      if (module.volumes) {
        module.volumes.forEach(volume => {
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

      volumes.push(`${hostWorkdir}:${moduleWorkdir}`)

      if (module.ports) module.ports.forEach(p => ports.push(p))

      return {
        name: module.name,
        hostDir: hostWorkdir,
        volumes: volumes,
        ports: ports,
        dockerfileData: dockerfileData
      }
    })
  }

  static validate(config) {
    const validator = new Validator()
    const {schema} = require('./schema')

    validator.validate(config, schema, { throwError: true })

    return config
  }

  hasDefaultModule() {
    return this.defaultModuleName !== undefined && this.defaultModuleName !== ''
  }

  getDefaultModule() {
    if (this.hasDefaultModule()) {
      return this.modules.find((c) => c.name === this.defaultModuleName)
    } else {
      return null
    }
  }

  getModule(moduleName) {
    return this.modules.find((c) => c.name === moduleName)
  }

  findInDockerfileData(moduleName, key) {
    const obj = this.modules
      .find((c) => c.name === moduleName)
      .dockerfileData
      .find((e) => Object.keys(e)[0] === key)

    return obj ? obj[key]: null
  }

  toDockerfile(moduleName) {
    return generator.generateDockerFileFromArray(
      this.modules.find((c) => c.name === moduleName).dockerfileData
    )
  }
}
