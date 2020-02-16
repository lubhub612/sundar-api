'use strict'

const Controller = require('egg').Controller

class MethodController extends Controller {

  async getMethodsByContract() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const contractName = this.ctx.params.contract
      this.ctx.body = await this.ctx.service.method.findByContractName(contractName)
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getOneByMethodName() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const { contract, name } = this.ctx.query
      this.ctx.body = await this.ctx.service.method.findOneByMethodName(contract, name)
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async replaceMethod() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const doc = this.ctx.request.body
      this.ctx.service.method.replace(doc._id, doc)
      this.ctx.body = {
        success: true,
      }
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async execMethod() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const { method, params } = this.ctx.request.body
      await this.app.web3p.personal.unlockAccount(payload.address, payload.passphrase, 15000000)
      this.ctx.body = {
        success: true,
        result: await this.service.method.execMethod(
          method.contract,
          method.name,
          params,
          payload.address),
      }
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }
}

module.exports = MethodController
