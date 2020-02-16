'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const solidity = new app.mongoose.Schema({
    name: { type: String, index: { unique: true } },
    data: Buffer,
  }, {
    collection: 'solidity',
  })

  return conn.model('solidity', solidity)
}
