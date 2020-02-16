'use strict'

const Subscription = require('egg').Subscription
const BigNumber = require('bignumber.js')
const _ = require('lodash')

class Patcher02 extends Subscription {
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
      interval: '1d',
      immediate: true,
      disable: false,
    }
  }

  async subscribe() {

    /**
     * Write the whole block object to DB
     * @param blockData
     */
    const writeBlockToDB = async blockData => {
      const result = await this.ctx.service.block.write(blockData)
      if (result) {
        if (!('quiet' in this.config.chain && this.config.chain.quiet === true)) {
          this.ctx.logger.info('DB successfully written for block #' + blockData.number.toString())
        }
      }
    }

    /**
     * Break transactions out of blocks and write to DB
     * @param blockData
     */
    const writeTransactionsToDB = async blockData => {
      const bulkOps = []
      if (blockData.transactions.length > 0) {
        for (const d in blockData.transactions) {
          const txData = blockData.transactions[ d ]
          txData.timestamp = blockData.timestamp
          txData.ethValue = this.ctx.helper.etherUnits.toEther(new BigNumber(txData.value), 'wei')
          txData.ethGasPrice = this.ctx.helper.etherUnits.toEther(new BigNumber(txData.gasPrice), 'wei')
          txData.inputVal = await this.ctx.helper.decodeInput(this.ctx, txData)
          bulkOps.push(txData)
        }
        const result = await this.ctx.service.transaction.writeCollection(bulkOps)
        if (result) {
          if (!('quiet' in this.config.chain && this.config.chain.quiet === true)) {
            this.ctx.logger.info('DB successfully written for transaction ' + blockData.transactions.length.toString())
          }
        }
      }
    }

    /**
     * Checks if the a record exists for the block number then ->
     *     if record exists: abort
     *     if record DNE: write a file for the block
     */
    const checkBlockDBExistsThenWrite = async blockData => {
      const isExists = await this.ctx.service.block.isBlockExistsByNumber(blockData.number)
      console.log(isExists)
      if (!isExists) {
        await writeBlockToDB(blockData)
        await writeTransactionsToDB(blockData)
      } else {
        this.ctx.logger.info('Block #' + blockData.number.toString() + ' already exists in DB.')
      }
    }

    const grabBlock = async blockHashOrNumber => {
      // check if done
      if (blockHashOrNumber === undefined) {
        return
      }
      const desiredBlockHashOrNumber = blockHashOrNumber
      if (this.app.web3p.isConnected()) {
        this.ctx.logger.info('Grabbing block #' + desiredBlockHashOrNumber)
        const blockData = await this.app.web3p.eth.getBlock(desiredBlockHashOrNumber)
        if (blockData == null) {
          this.ctx.logger.info('Warning: null block data received from the block with hash/number: ' + desiredBlockHashOrNumber)
        } else {
          await checkBlockDBExistsThenWrite(blockData)
        }
      } else {
        this.ctx.logger.error('Error: Aborted due to web3 is not connected when trying to get block ' + desiredBlockHashOrNumber)
        process.exit(9)
      }
    }

    const blockIter = async (firstBlock, lastBlock) => {
      // if consecutive, deal with it
      if (lastBlock < firstBlock) {
        return
      }
      if (lastBlock - firstBlock === 1) {
        await grabBlock(lastBlock)
        await grabBlock(firstBlock)
      } else if (lastBlock === firstBlock) {
        if (!this.ctx.service.block.isBlockExistsByNumber(firstBlock)) {
          await grabBlock(firstBlock)
        }
      } else {
        const count = await this.ctx.service.block.countBlock(firstBlock, lastBlock)
        const expectedBlocks = lastBlock - firstBlock + 1
        if (expectedBlocks > count) {
          this.ctx.logger.info('* ' + JSON.stringify(expectedBlocks - count) + ' missing blocks found, between #' + firstBlock + ' and #' + lastBlock)
          const midBlock = firstBlock + parseInt((lastBlock - firstBlock) / 2)
          await blockIter(firstBlock, midBlock)
          await blockIter(midBlock + 1, lastBlock)
        }
      }
    }

    /**
     * Block Patcher
     */
    const patchBlocks = async () => {
      // number of blocks should equal difference in block numbers
      const firstBlock = 0
      const lastBlock = this.app.web3p.eth.blockNumber - 1
      await blockIter(firstBlock, lastBlock)
    }

    if (this.config.chain.patch === true && this.app.syncChainComplete === true) {
      this.ctx.logger.info('*** Patch started ***')
      await patchBlocks()
    }
  }
}

module.exports = Patcher02
