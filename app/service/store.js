'use strict'

module.exports = app => {
  class StoreService extends app.Service {

    async upsertItem(item) {
      return await this.ctx.model.Item.findOneAndUpdate({ itemId: item.itemId }, item, { upsert: true })
    }

    async upsertRedeem(redeem) {
      return await this.ctx.model.Redeem.findOneAndUpdate({
        itemId: redeem.itemId,
        redeemBy: redeem.redeemBy,
        index: redeem.index,
      }, redeem, { upsert: true })
    }

    async saveRedeem(redeem) {
      return await this.ctx.model.Redeem(redeem)
        .save()
    }

    async saveStoreEvents(storeEvents, address) {
      let itemId = 0

      storeEvents.forEach(event => {
        if (event.name === 'itemId') {
          itemId = event.value
        }
      })
      const contractInstance = await this.ctx.service.contract.getContractOnChain(address)
      const itemResult = await contractInstance.getItem(itemId)
      const addressArray = await contractInstance.getRedeemAddresses(itemId)
      for (let i = 0; i < addressArray.length; i++) {
        const status = await contractInstance.getRedeemStatus(itemId, i)

        const redeem = {
          itemId,
          redeemBy: addressArray[ i ],
          status,
          index: i,
        }
        await this.upsertRedeem(redeem)
      }

      const item = {
        itemId: itemResult[ 0 ].toNumber(),
        status: itemResult[ 1 ],
        unitPrice: itemResult[ 2 ].toNumber(),
        title: itemResult[ 3 ],
        description: itemResult[ 4 ],
        availableUnit: itemResult[ 5 ].toNumber(),
        counter: itemResult[ 6 ].toNumber(),
        repeatable: itemResult[ 7 ],
        // effDate: new Date(itemResult[6].toNumber() * 1000),
        // expDate: new Date(itemResult[7].toNumber() * 1000),
        postedBy: itemResult[ 8 ],
      }

      const result = await this.upsertItem(item)
      if (result) {
        this.ctx.logger.info('Successfully saved item: ' + result.id)
      }
      return item
    }

    async getItems() {
      return await this.ctx.model.Item.find()
        .sort('status')
    }

    async getItemById(itemId) {
      const item = await this.ctx.model.Item.findOne({ itemId })
        .populate({ path: 'vendor', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'redeems', populate: { path: 'purchaser', select: 'address name pwcMail domain avatarId' } })

      return item
    }

    async getItemsByStatus(status) {
      const items = await this.ctx.model.Item.find({ status })
        .sort([[ 'createdBy', -1 ]])
        .populate({ path: 'vendor', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'redeems', populate: { path: 'purchaser', select: 'address name pwcMail domain avatarId' } })

      return items
    }

    async getPostedItems(address) {
      const items = await this.ctx.model.Item.find({ postedBy: address })
        .sort([[ 'createdBy', -1 ]])
        .populate({ path: 'vendor', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'redeems', populate: { path: 'purchaser', select: 'address name pwcMail domain avatarId' } })

      return items
    }

    async getRedeemItems(address) {
      const redeems = await this.ctx.model.Redeem.find({ redeemBy: address })
        .sort([[ 'createdBy', -1 ]])
        .populate({ path: 'item' })

      return redeems
    }

    async getRedeemItems_v2(address) {
      const redeems = await this.ctx.model.Redeem.find({ redeemBy: address }, {
        redeemBy: 0, purchaser: 0, item: 0, id: 0, _id: 0,
        status: 0, index: 0, createdAt: 0, updatedAt: 0,
      })
      const itemIds = redeems.map(r => r.itemId)
      // console.log(itemIds)
      const items = await this.ctx.model.Item.find({ itemId: itemIds })
        .sort([[ 'createdBy', -1 ]])
        .populate({ path: 'vendor', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'redeems', populate: { path: 'purchaser', select: 'address name pwcMail domain avatarId' } })

      return items
    }

    async postItem(account, params) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'postItem',
        params
      )

      return result
    }

    async redeem(account, itemId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)
      const params = {
        _itemId: itemId,
      }
      const redeemResult = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'redeem',
        params
      )
      return redeemResult
    }

    async delivery(account, params) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'delivery',
        params
      )

      return result
    }

    async confirm(account, params) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'confirm',
        params
      )

      return result
    }

    async voidItem(account, itemId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)
      const params = {
        _itemId: itemId,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'voidPostedItem',
        params
      )

      return result
    }

    async voidRedeem(account, params) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Market.sol:MarketExchange',
        'voidRedeemedItem',
        params
      )

      return result
    }
  }

  return StoreService
}
