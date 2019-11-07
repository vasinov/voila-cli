module.exports = class VoilaError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, VoilaError)
  }
}
