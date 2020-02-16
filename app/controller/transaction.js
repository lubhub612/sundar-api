'use strict'

const Controller = require('egg').Controller

class TransactionController extends Controller {

  async getTransactionByHash() {
    const hash = this.ctx.params.hash
    this.ctx.body = await this.ctx.service.transaction.getTransactionByHash(hash)
    this.status = 200
  }

  async getTransactions() {
    const skip = this.ctx.query.start ? parseInt(this.ctx.query.start) : 0
    const limit = this.ctx.query.amount ? parseInt(this.ctx.query.amount) : 100
    const dsc = this.ctx.query.dsc ? this.ctx.query.dsc : false
    this.ctx.body = await this.ctx.service.transaction.getTransactions(skip, limit, dsc)
    this.status = 200
  }

  async getTransactionCount() {
    this.ctx.body = await this.ctx.service.transaction.getTransactionCount()
    this.status = 200
  }
}

module.exports = TransactionController
