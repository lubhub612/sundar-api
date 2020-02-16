'use strict'

const Controller = require('egg').Controller

class FavorController extends Controller {

  async getFavors() {
    this.ctx.body = await this.ctx.service.favor.getFavors()
    this.ctx.status = 200
  }

  async getPostedFavors() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.favor.getPostedFavors(address)
    this.ctx.status = 200
  }

  async getAssignedFavors() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.favor.getAssignedFavors(address)
    this.ctx.status = 200
  }

  async getFavorById() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const favorId = this.ctx.params.favorId
      this.ctx.body = await this.ctx.service.favor.getFavorById(favorId)
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getCandidateFavors() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.favor.getCandidateFavors(address)
    this.ctx.status = 200
  }

  async postFavor() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    if (payload) {
      const account = await this.ctx.service.account._getAccountByAddress(payload.address)
      account.passphrase = payload.passphrase

      const favor = {
        _reward: this.ctx.request.body.reward,
        _description: this.ctx.request.body.description,
        _name: this.ctx.request.body.name,
      }

      this.ctx.body = await this.ctx.service.favor.postFavor(account, favor)
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async approveFavors() {
    const favorIds = this.ctx.request.body.favors.split(',')
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      // await this.ctx.service.account.unlockAccount(payload.address, payload.passphrase)
      const acc = await this.ctx.service.account._getAccountByAddress(payload.address)
      const keystore = JSON.parse(acc.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
      favorIds.forEach(id => {
        this.approveFavor(decryptedAccount, id)
      })
      this.ctx.body = {
        success: 'true',
      }
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async approveFavor(decryptedAccount, favorId) {
    const favor = await this.ctx.service.favor.getFavorById(favorId)
    this.ctx.logger.info(JSON.stringify(favor))
    if (!favor || favor.status !== 'Pending') {
      return
    }
    this.ctx.logger.info(await this.ctx.service.method.execMethodByAccount(
      decryptedAccount,
      'Favor.sol:FavorExchange',
      'approveFavor',
      { 0: favorId }))
  }

  async rejectFavors() {
    const favorIds = this.ctx.request.body.favors.split(',')
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      // await this.ctx.service.account.unlockAccount(payload.address, payload.passphrase)
      const acc = await this.ctx.service.account._getAccountByAddress(payload.address)
      const keystore = JSON.parse(acc.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
      favorIds.forEach(id => {
        this.rejectFavor(decryptedAccount, id)
      })
      this.ctx.body = {
        success: 'true',
      }
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async rejectFavor(decryptedAccount, favorId) {
    const favor = await this.ctx.service.favor.getFavorById(favorId)
    this.ctx.logger.info(JSON.stringify(favor))
    if (!favor || favor.status !== 'Pending') {
      return
    }
    this.ctx.logger.info(await this.ctx.service.method.execMethodByAccount(
      decryptedAccount,
      'Favor.sol:FavorExchange',
      'rejectFavor',
      { 0: favorId }))
  }

  async bid() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase
    this.ctx.body = await this.ctx.service.favor.bid(account, favorId)
  }

  async assign() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    const assignees = this.ctx.request.body.assignees
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    this.ctx.body = await this.ctx.service.favor.assign(account, favorId, assignees)
  }

  async complete() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    // const address = this.ctx.request.body.address
    // const passphrase = this.ctx.request.body.passphrase
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    this.ctx.body = await this.ctx.service.favor.complete(account, favorId)
  }

  async revertComplete() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    this.ctx.body = await this.ctx.service.favor.revertComplete(account, favorId)
  }

  async acknowledge() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    const assignees = this.ctx.request.body.assignees
    const rewards = this.ctx.request.body.rewards
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    this.ctx.body = await this.ctx.service.favor.acknowledge(account, favorId, assignees, rewards)
  }

  async cancel() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const favorId = this.ctx.request.body.id
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    this.ctx.body = await this.ctx.service.favor.cancel(account, favorId)
  }
}

module.exports = FavorController
