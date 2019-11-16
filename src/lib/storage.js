const fs = require('fs')

const PenguinError = require('./error/penguin-error')
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

      if (!fs.existsSync(fullPath)) {
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
      throw new PenguinError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
    }
  }

  remove = (tableName, key) => {
    const fullPath = this.fullPathTable(tableName)

    if (fs.existsSync(fullPath)) {
      const table = JSON.parse(fs.readFileSync(fullPath))

      delete table[key]
    } else {
      throw new PenguinError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
    }
  }

  list = tableName => {
    const fullPath = this.fullPathTable(tableName)

    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath))
    } else {
      throw new PenguinError(errorMessages.STORAGE_TABLE_DOESNT_EXIST)
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
    dockerPath: 'docker'
  },
  jobs: {

  }
}

module.exports = Storage
