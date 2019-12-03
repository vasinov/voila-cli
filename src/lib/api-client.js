const axios = require('axios')

const CliError = require('./error/cli-error')

class ApiClient {
  constructor(storage) {
    const apiUrl = ApiClient.apiUrl(storage)
    const accessToken = ApiClient.accessToken(storage)

    this.storage = storage
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {'Content-Type': 'application/json'},
      responseType: 'json'
    })

    if (accessToken) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    }
  }

  postTokens = async (email, password, tokenName) => {
    const basicToken = Buffer.from(`${email}:${password}`).toString('base64')

    this.client.defaults.headers.common['Authorization'] = `Basic ${basicToken}`

    const response = await this.client.post('/tokens', {
      access_token: {
        name: tokenName
      }
    }).catch(error => {
      throw new CliError(error.response.data.error)
    })

    return response.data
  }
}

ApiClient.accessToken = storage => storage.get('settings', 'accessToken')
ApiClient.apiUrl = storage => storage.get('settings', 'apiUrl')

module.exports = ApiClient
