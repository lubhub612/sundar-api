'use strict'

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (err) {
      ctx.app.emit('error', err.message ? err.message : err, ctx)
      const status = err.status || 500
      const error = err.message ?
        err.message
        : 'Internal Server Error'
      ctx.body = {
        success: false,
        message: error,
      }
      ctx.status = status
    }
  }
}
