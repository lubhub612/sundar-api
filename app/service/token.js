'use strict'

const _ = require('lodash')

module.exports = app => {
  class TokenService extends app.Service {
    async store(token) {
      return await new this.ctx.model.Token(token).save()
    }

    async getSpentToken(address) {
      return await this.ctx.model.Token.find({ from: address })
        .sort([[ 'timestamp', -1 ]])
        .populate({ path: 'payer', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'payee', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async getEarnedToken(address) {
      return await this.ctx.model.Token.find({ to: address })
        .sort([[ 'timestamp', -1 ]])
        .populate({ path: 'payer', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'payee', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async saveTransferEvent(transferEvents, title, type) {
      const token = {
        from: '',
        to: '',
        amount: '',
        timestamp: new Date().getTime(),
        title,
        type,
      }

      transferEvents.forEach(function(event) {
        if (event.name === 'from') {
          token.from = event.value
        }
        if (event.name === 'to') {
          token.to = event.value
        }
        if (event.name === 'value') {
          token.amount = Number(event.value)
        }
      })

      const result = await this.store(token)
      if (result) {
        this.ctx.logger.debug('Successfully transfer ' + result.amount
        + 'tokens from ' + result.from
        + ' to ' + result.to)
      }
    }
  }
  return TokenService
}
