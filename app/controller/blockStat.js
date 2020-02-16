'use strict'

const Controller = require('egg').Controller

class BlockStatController extends Controller {

  async getBlockStats() {
    this.ctx.body = await this.ctx.service.blockStat.getBlockStats(100)
    this.status = 200
  }
}

module.exports = BlockStatController
