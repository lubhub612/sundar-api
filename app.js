'use strict'

const BigNumber = require('bignumber.js')

// app.js
module.exports = app => {
  // Note, only after egg-ready event occurs can the message be sent
  app.messenger.once('egg-ready', () => {
    const ctx = app.createAnonymousContext()
    const listenBlocks = () => {
      ctx.logger.info('*** Block listening started ***')
      const newBlocks = app.web3.eth.filter('latest')
      newBlocks.watch((err, latestBlock) => {
        if (err) {
          // ctx.logger.error('Error: ' + err)
        } else if (latestBlock == null) {
          ctx.logger.info('Warning: null block hash')
        } else {
          // ctx.logger.info('Found new block: ' + latestBlock)
          if (app.web3.isConnected()) {
            app.web3.eth.getBlock(latestBlock, true, (err, blockData) => {
              if (err) {
                ctx.logger.info('Warning: error on getting block with hash/number: ' + latestBlock + ': ' + err)
              } else if (blockData == null) {
                ctx.logger.info('Warning: null block data received from the block with hash/number: ' + latestBlock)
              } else {
                ctx.service.block.writeBlockToDB(blockData, true)
                ctx.service.transaction.writeTransactionsToDB(blockData, true)
              }
            })
          } else {
            ctx.logger.error('Error: Web3 connection time out trying to get block ' + latestBlock + ' retrying connection now')
            listenBlocks()
          }
        }
      })
    }

    listenBlocks()

    // -- this will hang
    // for (let i = 0; i < 100000000000; i++) {
    //   console.log(i)
    // }

    // -- this seem working fine
    // setInterval(() => {
    //   console.log('test')
    // }, 5000)
  })
}
