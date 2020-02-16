'use strict'

const Controller = require('egg').Controller
const BigNumber = require('bignumber.js')
const _ = require('lodash')

class Web3Controller extends Controller {

  async relay() {
    const type = this.ctx.params.type
    const reqBody = this.ctx.request.body
    let options = {}
    let data = {}

    switch (type) {
      case 'tx':
        // reqBody: { "hash": "0x4e2cba4ec9f4a587588827ddf8ce4ee83b18afba309a6aa6db1c03bdc5a7ff8d" }
        const tx = await this.app.web3p.eth.getTransaction(reqBody.hash)
        if (tx) {
          tx.value = this.ctx.helper.etherUnits.toEther(new BigNumber(tx.value), 'wei')
          const block = await this.app.web3p.eth.getBlock(tx.blockNumber)
          if (block) {
            tx.timestamp = block.timestamp
            tx.isTrace = (tx.input !== '0x')
            this.ctx.body = tx
            this.ctx.status = 200
          }
        }
        break
      case 'addr':
        // reqBody: { "addr": "0xb8db1b76b61f1086262ea2945c50be2b13adbb57", "options": "balance,count,byteCode" }
        options = reqBody.options
        data = {}
        if (options.indexOf('balance') > -1) {
          data.balance = await this.app.web3p.eth.getBalance(reqBody.addr)
          data.balance = this.ctx.helper.etherUnits.toEther(data.balance, 'wei')
        }
        if (options.indexOf('count') > -1) {
          data.count = await this.app.web3p.eth.getTransactionCount(reqBody.addr)
        }
        if (options.indexOf('byteCode') > -1) {
          data.byteCode = await this.app.web3p.eth.getCode(reqBody.addr)
          data.isContract = data.byteCode.length > 2
        }
        this.ctx.body = data
        this.ctx.status = 200
        break
      case 'block':
        // reqBody: { "numHash": "0xb33c6874a783ac0e764909335d51c97e461da47f142531245322fcce289ac297" }
        let numHash = reqBody.numHash
        if (/^(0x)?[0-9a-f]{64}$/i.test(numHash.trim())) {
          numHash = numHash.trim()
        } else {
          numHash = parseInt(numHash.trim())
        }
        const block = await this.app.web3p.eth.getBlock(numHash)
        if (block) {
          this.ctx.body = this.ctx.helper.filter.filterBlocks(block)
          this.ctx.status = 200
        }
        break
      case 'uncle':
        // reqBody: { "uncle": "500/0" }
        const uncle = reqBody.uncle.trim()
        const arr = uncle.split('/')
        const uncleIdx = parseInt(arr[ 1 ]) || 0
        let blockNumOrHash

        if (/^(?:0x)?[0-9a-f]{64}$/i.test(arr[ 0 ])) {
          blockNumOrHash = arr[ 0 ].toLowerCase()
        } else {
          blockNumOrHash = parseInt(arr[ 0 ])
        }

        if (typeof blockNumOrHash !== 'undefined') {
          const u = await this.app.web3p.eth.getUncle(blockNumOrHash, uncleIdx)
          if (u) {
            this.ctx.body = this.ctx.helper.filter.filterBlocks(u)
            this.ctx.status = 200
          }
        }
        break
      case 'hashRate':
        // reqBody: {}
        const latest = await this.app.web3p.eth.getBlock('latest')
        if (latest) {
          let checkNum = latest.number - 100
          if (checkNum < 0) {
            checkNum = 0
          }
          const nBlock = latest.number - checkNum
          const block = await this.app.web3p.eth.getBlock(checkNum)
          if (block) {
            const blockTime = (latest.timestamp - block.timestamp) / nBlock
            const hashRate = latest.difficulty / blockTime
            this.ctx.body = {
              blockHeight: latest.number,
              difficulty: latest.difficulty,
              blockTime,
              hashRate,
            }
            this.ctx.status = 200
          }
        }
        break
      default:
        this.ctx.logger.warn(`Invalid request: ${type}: ${JSON.stringify(reqBody)}`)
        this.status = 400
    }
  }
}

module.exports = Web3Controller
