'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const block = new app.mongoose.Schema({
    number: { type: Number, index: { unique: true } },
    hash: String,
    parentHash: String,
    nonce: String,
    sha3Uncles: String,
    logsBloom: String,
    transactionsRoot: String,
    stateRoot: String,
    receiptRoot: String,
    miner: String,
    difficulty: String,
    totalDifficulty: String,
    size: Number,
    extraData: String,
    gasLimit: Number,
    gasUsed: Number,
    timestamp: Number,
    blockTime: Number,
    uncles: [ String ],
    transactions: [ String ],
  }, {
    collection: 'block',
  })

  // create indices
  block.index({ timestamp: -1, number: 1 })

  return conn.model('block', block)
}
