'use strict'

module.exports = app => {
  return async (ctx, next) => {
    // Acts on each data packet (each message).
    // In the production environment, it is usually used to preprocess messages, or it is used to decrypt encrypted messages.
    ctx.socket.emit('res', 'packet received!')
    // console.log('packet:', ctx.packet)
    await next()
  }
}
