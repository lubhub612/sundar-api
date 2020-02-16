'use strict'

const _ = require('lodash')

module.exports = app => {
  class AccountService extends app.Service {

    async create(account) {
      await new this.ctx.model.Account(account).save()
    }

    async getDomainList() {
      return await this.ctx.model.Account.schema.path('domain').enumValues
    }

    async getAllAccounts() {
      return await this.ctx.model.Account.find({}, 'address name avatarId pwcMail domain status')
    }

    async getAccounts(skip, limit) {
      return await this.ctx.model.Account.find({}, 'address name avatarId pwcMail domain status')
        .limit(limit)
        .skip(skip)
    }

    async getAccountNumber() {
      return await this.ctx.model.Account.countDocuments()
    }

    async getAccountsByStatus(status, skip, limit) {
      return await this.ctx.model.Account.find({ status }, 'address name avatarId pwcMail domain status')
        .limit(limit)
        .skip(skip)
    }

    async getAccountByAddress(address) {
      return await this.ctx.model.Account.findOne({ address }, 'address name avatarId pwcMail domain status isAdmin')
    }

    async _getAccountByAddress(address) {
      return await this.ctx.model.Account.findOne({ address }, 'address name avatarId pwcMail domain status keystore isAdmin')
    }

    async getAccountByMail(pwcMail) {
      return await this.ctx.model.Account.findOne({ pwcMail }, 'address name avatarId pwcMail domain status ')
    }

    async _getAccountByMail(pwcMail) {
      return await this.ctx.model.Account.findOne({ pwcMail }, 'address name avatarId pwcMail domain status keystore isAdmin')
    }

    async putStatusByToken(activateToken, status) {
      return await this.ctx.model.Account.findOneAndUpdate({ activateToken }, { status }, { activateDate: new Date() })
    }

    async updateActivateToken(address, activateToken, tokenExpireTime) {
      await this.ctx.model.Account.updateOne({ address }, { activateToken, tokenExpireTime })
    }

    async updateStatus(address, status) {
      await this.ctx.model.Account.updateOne({ address }, { status })
    }

    async deleteActivateToken(address) {
      await this.ctx.model.Account.updateOne({ address }, { activateToken: '' })
    }

    async unlockAccount(address = this.config.chain.defaultCoinbase, passphrase = this.config.chain.defaultPwd) {
      await this.app.web3p.personal.unlockAccount(address, passphrase, 15000000)
    }

    async deleteByAddress(address) {
      await this.ctx.model.Account.remove({ address })
      return true
    }
  }

  return AccountService
}
