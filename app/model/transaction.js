'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const transaction = new app.mongoose.Schema({
    hash: { type: String, index: { unique: true } },
    nonce: Number,
    blockHash: String,
    blockNumber: Number,
    transactionIndex: Number,
    from: String,
    to: String,
    value: String,
    gas: Number,
    gasPrice: String,
    timestamp: Number,
    input: String,
    status: String,
    logs: String,
  }, {
    collection: 'transaction',
  })

  // create indices
  transaction.index({ blockNumber: -1 })
  transaction.index({ from: 1, blockNumber: -1 })
  transaction.index({ to: 1, blockNumber: -1 })

  return conn.model('transaction', transaction)
}
