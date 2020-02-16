'use strict'

const Controller = require('egg').Controller

class TokenController extends Controller {

  async getSpentToken() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.token.getSpentToken(address)
    this.status = 200
  }

  async getEarnedToken() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.token.getEarnedToken(address)
    this.status = 200
  }
}

module.exports = TokenController
