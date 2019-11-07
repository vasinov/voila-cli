const fs = require('fs')

module.exports = class StateManager {
  constructor(path) {
    this.path = path
    this.jsonName = 'state.json'

    this.createOrLoadJson()
  }

  listContainers(projectId) {

  }

  addContainer(projectId, name) {

  }

  removeContainer(projectId, name) {

  }

  fullPath() {
    return `${this.path}/${this.jsonName}`
  }

  createOrLoadJson() {
    const newJson = (fs.existsSync(this.fullPath())) ?
      fs.readFileSync(this.fullPath(), 'utf8') :
      this.defaultJson()

    if (!fs.existsSync(this.fullPath())) fs.mkdirSync(this.path, { recursive: true })

    fs.writeFileSync(this.fullPath(), JSON.stringify(newJson), (err) => {
      throw new Error(err.message)
    })
  }

  defaultJson() {
    return {
      projects: {}
    }
  }
}
