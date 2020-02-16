'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const blockStat = new app.mongoose.Schema({
    number: { type: Number, index: { unique: true } },
    timestamp: Number,
    difficulty: String,
    hashrate: String,
    txCount: Number,
    gasUsed: Number,
    gasLimit: Number,
    miner: String,
    blockTime: Number,
    uncleCount: Number,
  }, {
    collection: 'blockStat',
  })

  return conn.model('blockStat', blockStat)
}
