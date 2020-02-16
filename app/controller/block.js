'use strict'

const Controller = require('egg').Controller

class BlockController extends Controller {

  async getBlockByNumber() {
    const number = this.ctx.params.number
    this.ctx.body = await this.ctx.service.block.getBlockByNumber(number)
  }

  async getBlocks() {
    const skip = this.ctx.query.start ? parseInt(this.ctx.query.start) : 0
    const limit = this.ctx.query.amount ? parseInt(this.ctx.query.amount) : 100
    const dsc = this.ctx.query.dsc ? this.ctx.query.dsc : false
    this.ctx.body = await this.ctx.service.block.getBlocks(skip, limit, dsc)
  }
}

module.exports = BlockController
