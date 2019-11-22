module.exports = class CliError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, CliError)
  }
}
