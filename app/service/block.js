'use strict'

const _ = require('lodash')

module.exports = app => {
  class BlockService extends app.Service {

    async getBlockByNumber(number) {
      const doc = await this.ctx.model.Block.findOne({ number }, 'number timestamp hash parentHash sha3Uncles miner difficulty totalDifficulty size gasUsed gasLimit nonce extraData')
      doc.transactions = await this.ctx.model.Transaction.find({ blockNumber: number }, 'hash').sort('-timestamp') || []
      const block = this.ctx.helper.filter.filterBlocks([ doc ])
      return block[ 0 ]
    }

    async getBlocks(skip, limit, dsc) {
      const ascSign = dsc ? '-' : ''
      const blocks = await this.ctx.model.Block.find({}, 'number timestamp uncles miner gasUsed gasLimit extraData')
        .lean(true)
        .sort(`${ascSign}number`)
        .limit(limit)
        .skip(skip)
      const blockNumber = blocks.lengh > 0 ? blocks[ blocks.length - 1 ].number : 0

      // aggregate transaction counters
      const txnAgg = await this.ctx.model.Transaction.aggregate([
        { $match: { blockNumber: { $gte: blockNumber } } },
        { $group: { _id: '$blockNumber', count: { $sum: 1 }, avgGasPrice: { $avg: '$gasPrice' } } },
      ])

      const txns = {}
      const avgGasPrices = {}
      _.forEach(txnAgg, async t => {
        txns[ t._id ] = t.count
        avgGasPrices[ t._id ] = t.avgGasPrice
      })

      blocks.forEach(function(b) {
        b.txn = txns[ b.number ] || 0
        b.avgGasPrice = avgGasPrices[ b.number ] || 0
      })

      return this.ctx.helper.filter.filterBlocks(blocks)
    }

    async countBlockByAccountAddress(addr) {
      const count = await this.ctx.model.Block.count({ miner: addr })
      return count
    }

    async isBlockExistsByNumber(number) {
      const doc = await this.ctx.model.Block.find({ number })
      return doc.length > 0
    }

    async countBlock(firstBlock, lastBlock) {
      const count = await this.ctx.model.Block.count({ number: { $gte: firstBlock, $lte: lastBlock } })
      return count
    }

    async write(blockData) {
      const block = this.ctx.model.Block(blockData)
      return await block.save()
    }

    async writeCollection(bulk) {
      return await this.ctx.model.Block.collection.insertMany(bulk)
    }

    async findOldBlock() {
      return await this.ctx.model.Block.find({}, 'number')
        .lean(true)
        .sort('number')
        .limit(1)
    }

    /**
     * Write the whole block object to DB
     * @param blockData
     * @param flush
     */
    async writeBlockToDB(blockData, flush) {
      const self = this.writeBlockToDB
      if (!self.bulkOps) {
        self.bulkOps = []
      }
      if (blockData && blockData.number >= 0) {
        self.bulkOps.push(new this.ctx.model.Block(blockData))
        this.ctx.logger.info('- block #' + blockData.number.toString() + ' inserted.')
      }
      if (flush && self.bulkOps.length > 0 || self.bulkOps.length >= this.config.chain.bulkSize) {
        const bulk = self.bulkOps
        self.bulkOps = []
        if (bulk.length === 0) return

        this.writeCollection(bulk, (err, blocks) => {
          if (typeof err !== 'undefined' && err) {
            if (err.code === 11000) {
              if (!('quiet' in this.config.chain && this.config.chain.quiet === true)) {
                this.ctx.logger.info('Skip: Duplicate DB key : ' + err)
              }
            } else {
              this.ctx.logger.error('Error: Aborted due to error on DB: ' + err)
              process.exit(9)
            }
          } else {
            this.ctx.logger.info('# ' + blocks.insertedCount + ' blocks successfully written.')
          }
        })
      }
    }
  }

  return BlockService
}
