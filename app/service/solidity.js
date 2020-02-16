'use strict'

const _ = require('lodash')

module.exports = app => {
  class SolidityService extends app.Service {

    async write(sol) {
      await new this.ctx.model.Solidity(sol).save()
    }

    async getAllSolidities() {
      return await this.ctx.model.Solidity.find({}).sort('status')
    }

    async getSolidityById(id) {
      return await this.ctx.model.Solidity.findOne({ _id: id })
    }

    async getSolidityByName(name) {
      return await this.ctx.model.Solidity.findOne({ name })
    }

    async getMultipleSolidityByName(names) {
      const query = []
      names.forEach(name => {
        query.push({ name })
      })
      return await this.ctx.model.Solidity.find({ $or: query })
    }

    async getPending() {
      return await this.ctx.model.Solidity.find({ status: 'pending' })
    }

    async getLocked() {
      return await this.ctx.model.Solidity.find({ status: 'locked' })
    }

    async getProcessed() {
      return await this.ctx.model.Solidity.find({ status: 'processed' })
    }

    async update(id, value) {
      return await this.ctx.model.Solidity.updateOne({ _id: id }, value)
    }

    async updateStatus(id, status) {
      return await this.ctx.model.Solidity.findOneAndUpdate({ _id: id }, { status })
    }

    async updateMetadata(id, metadata) {
      return await this.ctx.model.Solidity.updateOne({ _id: id }, { metadata })
    }

  }

  return SolidityService
}
