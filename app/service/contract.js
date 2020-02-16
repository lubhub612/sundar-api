'use strict'

const _ = require('lodash')

module.exports = app => {
  class ContractService extends app.Service {
    async store(contract) {
      await new this.ctx.model.Contract(contract).save()
    }

    async getContractByAddr(address) {
      return await this.ctx.model.Contract.findOne({ address })
    }

    async getAllContracts() {
      return await this.ctx.model.Contract.find({})
    }

    async getContractByName(contractName) {
      return await this.ctx.model.Contract.findOne({ contractName })
    }

    async updateContractType(address, type) {
      await this.ctx.model.Contract.updateOne({ address }, { type })
    }

    async updateContractWalletUnabled(address, walletEnabled) {
      await this.ctx.model.Contract.updateOne({ address }, { walletEnabled })
    }

    async updateContractConfig(address, type, walletEnabled, alias) {
      await this.ctx.model.Contract.updateOne({ address }, { type, walletEnabled, alias })
    }

    async getContractOnChain(address) {
      const contract = await this.getContractByAddr(address)
      const abiArray = JSON.parse(contract.abi)
      const contractAbi = await this.app.web3.eth.contract(abiArray)
      return await contractAbi.at(contract.address)
    }
  }

  return ContractService
}
