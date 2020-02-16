'use strict'

const Subscription = require('egg').Subscription
const BigNumber = require('bignumber.js')
const _ = require('lodash')

class Sync extends Subscription {
  /**
   * @property {Object} schedule
   *  - {String} type - schedule type, `worker` or `all` or your custom types.
   *  - {String} [cron] - cron expression, see [below](#cron-style-scheduling)
   *  - {Object} [cronOptions] - cron options, see [cron-parser#options](https://github.com/harrisiirak/cron-parser#options)
   *  - {String | Number} [interval] - interval expression in millisecond or express explicitly like '1h'. see [below](#interval-style-scheduling)
   *  - {Boolean} [immediate] - To run a scheduler at startup
   *  - {Boolean} [disable] - whether to disable a scheduler, usually use in dynamic schedule
   *  - {Array} [env] - only enable scheduler when match env list
   */
  static get schedule() {
    return {
      type: 'worker',
      interval: '1y',
      immediate: true,
      disable: false,
    }
  }

  async subscribe() {
    /**
     * check oldest block or starting block then callback
     * @param callback
     */
    const prepareSync = async () => {
      let blockNumber = null
      const docs = await this.ctx.service.block.findOldBlock()
      if (!docs || docs.length < 1) {
        // not found in db. sync from config.chain.endBlock or 'latest'
        if (this.app.web3p.isConnected()) {
          const currentBlock = this.app.web3p.eth.blockNumber
          const latestBlock = this.config.chain.endBlock || currentBlock || 'latest'
          if (latestBlock === 'latest') {
            const blockData = await this.app.web3p.eth.getBlock(latestBlock)
            if (blockData == null) {
              this.ctx.logger.info('Warning: null block data received from the block with hash/number: ' + latestBlock)
            } else {
              this.ctx.logger.info('Starting block number = ' + blockData.number)
              blockNumber = blockData.number - 1
              return blockNumber
            }
          } else {
            this.ctx.logger.info('Starting block number = ' + latestBlock)
            blockNumber = latestBlock - 1
            return blockNumber
          }
        } else {
          this.ctx.logger.error('Error: Web3 connection error')
          return null
        }
      } else {
        blockNumber = docs[0].number - 1
        this.ctx.logger.info('Old block found. Starting block number = ' + blockNumber)
        return blockNumber
      }
    }

    /**
     * If full sync is checked this function will start syncing the block chain from lastSynced param see README
     * @param nextBlock
     */
    const syncChain = async nextBlock => {
      if (this.app.web3p.isConnected()) {
        if (typeof nextBlock === 'undefined') {
          nextBlock = await prepareSync()
        }

        if (nextBlock == null) {
          this.ctx.logger.info('nextBlock is null')
          return
        } else if (nextBlock < this.config.chain.startBlock) {
          await this.ctx.service.block.writeBlockToDB(null, true)
          await this.ctx.service.transaction.writeTransactionsToDB(null, true)
          this.config.chain.syncAll = false
          this.app.syncChainComplete = true
          this.ctx.logger.info('*** Sync completed ***')
          return
        }

        let count = this.config.chain.bulkSize
        while (nextBlock >= this.config.chain.startBlock && count > 0) {
          const blockData = await this.app.web3p.eth.getBlock(nextBlock)
          if (blockData == null) {
            this.ctx.logger.info('Warning: null block data received from the block with hash/number: ' + nextBlock)
          } else {
            await this.ctx.service.block.writeBlockToDB(blockData)
            await this.ctx.service.transaction.writeTransactionsToDB(blockData)
          }
          nextBlock--
          count--
        }

        setTimeout(async () => {
          this.ctx.logger.info('nextBlock: ' + nextBlock)
          await syncChain(nextBlock)
        }, 500)
      } else {
        this.ctx.logger.info('Error: Web3 connection time out trying to get block ' + nextBlock + ' retrying connection now')
        await syncChain(nextBlock)
      }
    }

    if (this.config.chain.syncAll === true && this.app.syncChain === undefined) {
      this.app.syncChain = true
      this.ctx.logger.info('*** Sync started ***')
      await syncChain()
    } else {
      this.app.syncChainComplete = true
    }
  }
}

module.exports = Sync
