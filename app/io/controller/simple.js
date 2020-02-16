'use strict'

const Controller = require('egg').Controller

class SimpleController extends Controller {
  async blockTime() {
    let lastBlockTime = 0
    let lastBlock = 0
    const { ctx } = this
    setInterval(() => {
      this.ctx.service.block.getBlocks(undefined, undefined, true)
        .then(response => {
          if (response[0].number !== lastBlock) {
            lastBlockTime = (((response[0].timestamp * 1000) - (response[1].timestamp * 1000)) / 600).toFixed(1)
            ctx.socket.emit('blockTimeRes', {
              blockNumber: response[0].number,
              value: lastBlockTime,
            })
            lastBlock = response[0].number
          }
        })
        .catch(error => {
          console.log(error)
        })
    }, 2000)
  }
}

module.exports = SimpleController
