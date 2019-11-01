const axios = require('axios')

require('dotenv').config()

class ApiClient {
  static apiUrl() {
    return `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/api`
  }

  static get(path) {
    return axios.get(`${this.apiUrl()}/${path}`)
  }
}

module.exports = ApiClient
