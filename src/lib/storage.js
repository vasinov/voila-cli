const fs = require('fs')

const CliError = require('./error/cli-error')
const errorMessages = require('./error/messages')

class Storage {
  constructor(storagePath) {
    this.storagePath = storagePath
  }

  fullPathTable = tableName => {
    return `${this.storagePath}/${tableName}.json`
  }

  init = () => {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true })
    }

    Object.entries(Storage.defaultTables).forEach(t => {
      const fullPath = this.fullPathTable(t[0])

      if (fs.existsSync(fullPath)) {
        Object.entries(t[1]).forEach(p => {
          if (!this.get(t[0], p[0])) this.set(t[0], p[0], p[1])
        })
      } else {
        fs.writeFileSync(fullPath, JSON.stringify(t[1]))
      }
    })
  }

  get = (tableName, key) => {
    const fullPath = this.fullPathTable(tableName)

    if (fs.existsSync(fullPath)) {
      const table = JSON.parse(fs.readFileSync(fullPath))

      return table[key]
    } else {
      throw new CliError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
    }
  }

  remove = (tableName, key) => {
    const fullPath = this.fullPathTable(tableName)

    if (fs.existsSync(fullPath)) {
      const table = JSON.parse(fs.readFileSync(fullPath))

      delete table[key]

      fs.writeFileSync(fullPath, JSON.stringify(table))
    } else {
      throw new CliError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
    }
  }

  list = tableName => {
    const fullPath = this.fullPathTable(tableName)

    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath))
    } else {
      throw new CliError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
    }
  }

  set = (tableName, key, value) => {
    const fullPath = this.fullPathTable(tableName)

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify({}))
    }

    const table = JSON.parse(fs.readFileSync(fullPath))

    table[key] = value

    fs.writeFileSync(fullPath, JSON.stringify(table))
  }
}

Storage.defaultTables = {
  settings: {
    dockerPath: 'docker',
    apiUrl: 'https://platform.voila.dev/api'
  },
  credentials: {},
  jobs: {}
}

module.exports = Storage
