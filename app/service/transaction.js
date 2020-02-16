'use strict'

const BigNumber = require('bignumber.js')

module.exports = app => {
  class TransactionService extends app.Service {

    async getTransactionByHash(hash) {
      const doc = await this.ctx.model.Transaction.find({ hash })
      return doc[ 0 ]
    }

    async getTransactions(skip, limit, dsc) {
      const ascSign = dsc ? '-' : ''
      const txns = await this.ctx.model.Transaction.find({})
        .lean(true)
        .sort(`${ascSign}blockNumber`)
        .limit(limit)
        .skip(skip)
      return txns
    }

    async getTransactionCount() {
      return await this.ctx.model.Transaction.countDocuments()
    }

    async getTransactionByAccountAddress(addr, offset, limit) {
      const doc = await this.ctx.model.Transaction.find({ $or: [{ to: addr }, { from: addr }] })
        .lean(true)
        .sort('-blockNumber')
        .skip(offset)
        .limit(limit)
      const txs = this.ctx.helper.filter.countTXeth(doc, addr)
      return txs
    }

    async countTransactionByAccountAddress(addr) {
      const count = await this.ctx.model.Transaction.countDocuments({ $or: [{ to: addr }, { from: addr }] })
      return count
    }

    async writeCollection(bulk) {
      return await this.ctx.model.Transaction.collection.insertMany(bulk)
    }

    async write(transaction) {
      return await this.ctx.model.Transaction(transaction)
        .save()
    }

    async handleTransactionLogs(logs, contractor) {
      const transferEvents = []
      let favorEvents
      let storeEvents
      let title
      let type
      if (logs) {
        for (const log of logs) {
          if (log && log.name === 'Transfer' && log.events.length > 0) {
            transferEvents.push(log.events)
          }
          if (log && log.name === 'FavorEmitted' && log.events.length > 0) {
            favorEvents = log.events
          }
          if (log && log.name === 'ItemEmitted' && log.events.length > 0) {
            storeEvents = log.events
          }
        }

        if (favorEvents) {
          const favor = await this.ctx.service.favor.saveFavorEvents(favorEvents, contractor)
          title = favor.name
          type = 'favor'
        }
        if (storeEvents) {
          const item = await this.ctx.service.store.saveStoreEvents(storeEvents, contractor)
          title = item.title
          type = 'store'
        }
        if (transferEvents && transferEvents.length > 0) {
          for (const event of transferEvents) {
            await this.ctx.service.token.saveTransferEvent(event, title, type)
          }
        }
      }
    }

    /**
     * Break transactions out of blocks and write to DB
     * @param blockData
     * @param flush
     */
    async writeTransactionsToDB(blockData, flush) {
      const self = this.writeTransactionsToDB
      if (!self.bulkOps) {
        self.bulkOps = []
        self.blocks = 0
      }
      if (blockData && blockData.transactions.length > 0) {
        for (let i = 0; i < blockData.transactions.length; i++) {
          const txData = blockData.transactions[ i ]
          if (typeof txData === 'object') {
            txData.timestamp = blockData.timestamp
            txData.ethValue = this.ctx.helper.etherUnits.toEther(new BigNumber(txData.value), 'wei')
            txData.ethGasPrice = this.ctx.helper.etherUnits.toEther(new BigNumber(txData.gasPrice), 'wei')
            txData.inputVal = await this.ctx.helper.decodeInput(this.ctx, txData)
            self.bulkOps.push(txData)
          }
        }
        this.ctx.logger.info('- block #' + blockData.number.toString() + ': ' + blockData.transactions.length.toString() + ' transactions recorded.')
      }
      self.blocks++

      if (flush && self.blocks > 0 || self.blocks >= this.config.chain.bulkSize) {
        const bulk = self.bulkOps
        self.bulkOps = []
        self.blocks = 0
        if (bulk.length === 0) return

        for (const transaction of bulk) {
          // const transaction = bulk[i]
          // transaction logs on chain.
          const receipt = await this.app.web3p.eth.getTransactionReceipt(transaction.hash)
          if (receipt) {
            const logs = await this.ctx.helper.decodeTxReceiptLogs(this.ctx, receipt)

            transaction.status = receipt.status
            transaction.logs = JSON.stringify(logs)

            if (receipt && logs.length > 0) {
              await this.handleTransactionLogs(logs, receipt.to)
            } else {
              this.ctx.logger.info('No transaction receipt or logs found for : ' + transaction.hash)
            }
          }
          const txResult = await this.write(transaction)
          if (txResult) {
            this.ctx.logger.info('Transaction #' + transaction.hash + ' successfully written.')
          }
        }
      }
    }
  }

  return TransactionService
}
