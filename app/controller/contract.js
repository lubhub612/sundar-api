'use strict'

const Controller = require('egg').Controller

class ContractController extends Controller {

  async getAllContracts() {
    this.ctx.body = await this.ctx.service.contract.getAllContracts()
    this.status = 200
  }

  async getContractByAddr() {
    const addr = this.ctx.params.address
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      this.ctx.body = await this.ctx.service.contract.getContractByAddr(addr)
      this.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getContractByName() {
    const name = this.ctx.params.name
    this.ctx.body = await this.ctx.service.contract.getContractByName(name)
    this.status = 200
  }

  async updateContractConfig() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const { addr } = this.ctx.params
      const { type, enabled, alias } = this.ctx.request.body
      await this.ctx.service.contract.updateContractConfig(addr, type, enabled, alias)
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

  async deploy() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const { constructorParams, contracts } = this.ctx.request.body
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      await this.app.web3p.personal.unlockAccount(payload.address, payload.passphrase, 15000000)
      for (const c of contracts) {
        await this._deployOne(c, constructorParams[ c.name ], payload.address)
      }
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

  async _deployOne(mtdt, paramObj, account) {
    const contract = this.app.web3.eth.contract(JSON.parse(mtdt.abi))
    const params = paramObj ? Object.values(paramObj) : []
    await contract.new(...params, {
      data: `0x${mtdt.binary}`,
      from: account,
      gas: 4700000,
    }, (err, newContract) => {
      if (err) {
        this.ctx.logger.info(`${mtdt.name} err: ${err}`)
      } else {
        if (!newContract.address) {
          this.ctx.logger.info(`transactionHash : ${newContract.transactionHash}`)
        } else {
          this.ctx.logger.info(`${mtdt.name}'s transactionAddress : ${newContract.address}`)
          const contractDeployed = {
            creationTransaction: newContract.transactionHash,
            address: newContract.address,
            contractName: mtdt.name,
            compilerVersion: this.config.compilerVersion,
            abi: mtdt.abi,
            byteCode: mtdt.binary,
            params,

          }
          this.ctx.service.contract.store(contractDeployed)
          this.ctx.service.method.updateStatusByContractName(mtdt.name, 'Active')
        }
      }
    })
  }
}

module.exports = ContractController
