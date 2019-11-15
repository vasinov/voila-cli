module.exports = class PenguinError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, PenguinError)
  }
}
