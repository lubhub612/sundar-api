'use strict'

const Controller = require('egg').Controller

class StoreController extends Controller {
  async getItemById() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const itemId = this.ctx.params.itemId
      this.ctx.body = await this.ctx.service.store.getItemById(itemId)
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getItemsByStatus() {
    const status = this.ctx.params.status
    this.ctx.body = await this.ctx.service.store.getItemsByStatus(status)
    this.ctx.status = 200
  }

  async getItems() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const items = await this.ctx.service.store.getItems()
      this.ctx.body = items
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getPostedItems() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.store.getPostedItems(address)
    this.ctx.status = 200
  }

  async getRedeemItems() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.store.getRedeemItems(address)
    this.ctx.status = 200
  }

  async getRedeemItems_v2() {
    const address = this.ctx.params.address
    this.ctx.body = await this.ctx.service.store.getRedeemItems_v2(address)
    this.ctx.status = 200
  }

  async approveItems() {
    const itemIds = this.ctx.request.body.items.split(',')
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {

      const acc = await this.ctx.service.account._getAccountByAddress(payload.address)
      const keystore = JSON.parse(acc.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
      // await this.ctx.service.account.unlockAccount(payload.address, payload.passphrase)

      itemIds.forEach(id => {
        this._approveOneItem(decryptedAccount, id)
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

  async _approveOneItem(decryptedAccount, itemId) {
    const item = await this.ctx.service.store.getItemById(itemId)
    this.ctx.logger.info(JSON.stringify(item))
    if (!item || item.status !== 'Pending') {
      return
    }
    this.ctx.logger.info(await this.ctx.service.method.execMethodByAccount(
      decryptedAccount,
      'Market.sol:MarketExchange',
      'approveItem',
      { 0: itemId }))
  }

  async rejectItems() {
    const itemIds = this.ctx.request.body.items.split(',')
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {

      const acc = await this.ctx.service.account._getAccountByAddress(payload.address)
      const keystore = JSON.parse(acc.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
      // await this.ctx.service.account.unlockAccount(payload.address, payload.passphrase)

      itemIds.forEach(id => {
        this.rejectItem(decryptedAccount, id)
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

  async rejectItem(decryptedAccount, itemId) {
    const item = await this.ctx.service.store.getItemById(itemId)
    // console.log(JSON.stringify(item))
    if (!item || item.status !== 'Pending') {
      return
    }
    this.ctx.logger.info(await this.ctx.service.method.execMethodByAccount(
      decryptedAccount,
      'Market.sol:MarketExchange',
      'rejectItem',
      { 0: itemId }))
  }

  async postItem() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const item = {
      _unitPrice: this.ctx.request.body.unitPrice,
      _title: this.ctx.request.body.title,
      _description: this.ctx.request.body.description,
      _availableUnit: this.ctx.request.body.availableUnit,
      _repeatable: this.ctx.request.body.repeatable,
    }
    this.ctx.body = await this.ctx.service.store.postItem(account, item)
  }

  async redeem() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const itemId = this.ctx.request.body.itemId
    this.ctx.body = await this.ctx.service.store.redeem(account, itemId)
  }

  async delivery() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const params = {
      _itemId: this.ctx.request.body.itemId,
      _account: this.ctx.request.body.redeemBy,
      _index: this.ctx.request.body.index,
    }

    this.ctx.body = await this.ctx.service.store.delivery(account, params)
  }

  async confirm() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const params = {
      _itemId: this.ctx.request.body.itemId,
      _account: this.ctx.request.body.redeemBy,
      _index: this.ctx.request.body.index,
    }

    this.ctx.body = await this.ctx.service.store.confirm(account, params)
  }

  async voidItem() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const itemId = this.ctx.request.body.itemId

    this.ctx.body = await this.ctx.service.store.voidItem(account, itemId)
  }

  async voidRedeem() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    account.passphrase = payload.passphrase

    const params = {
      _itemId: this.ctx.request.body.itemId,
      _account: this.ctx.request.body.redeemBy,
      _index: this.ctx.request.body.index,
    }

    this.ctx.body = await this.ctx.service.store.voidRedeem(account, params)
  }
}

module.exports = StoreController
