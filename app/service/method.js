'use strict'

const _ = require('lodash')

module.exports = app => {
  class MethodService extends app.Service {

    async write(method) {
      await new this.ctx.model.Method(method).save()
    }

    async findByContractName(contract) {
      return await this.ctx.model.Method.find({ contract, type: 'function', status: 'Active' })
    }

    async findOneByMethodName(contract, name) {
      return await this.ctx.model.Method.findOne({ contract, name })
    }

    async updateStatusByContractName(contract, status) {
      await this.ctx.model.Method.updateMany({ contract }, { status })
    }

    async replace(_id, method) {
      await this.ctx.model.Method.replaceOne({ _id }, method)
    }

    async execMethod(contractName, method, params, from) {
      const mtdt = await this.ctx.service.contract.getContractByName(contractName)
      const contract = this.app.web3.eth.contract(JSON.parse(mtdt.abi))
      const contractInstance = contract.at(mtdt.address)
      const prms = params ? Object.values(params) : []
      const result = contractInstance[ method ](...prms, {
        gas: 4700000,
        from,
      })
      return result
    }

    async execMethodByAccount(account, contractName, method, params) {
      const contract = await this.ctx.service.contract.getContractByName(contractName)
      const eContract = this.app.web3.eth.contract(JSON.parse(contract.abi))
      const eContractInstance = eContract.at(contract.address)
      const prms = params ? Object.values(params) : []
      const data = eContractInstance[ method ].getData(...prms)

      const tx = {
        from: account.address,
        to: contract.address,
        gas: 4700000,
        data,
      }
      const signed = await account.signTransaction(tx)
      const txHash = await this.app.web3p.eth.sendRawTransaction(signed.rawTransaction)
      const result = {
        data,
        signed,
        txHash,
      }
      return result
    }
  }

  return MethodService
}
