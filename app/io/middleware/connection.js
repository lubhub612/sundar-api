'use strict'

module.exports = () => {
  return async (ctx, next) => {
    // Fires when each client connects or quits.
    // Therefore, we usually perform authorization authentication at this step, and deal with the failed clients.
    ctx.socket.emit('res', 'connected!')
    await next() // execute when disconnect.
  }
}
