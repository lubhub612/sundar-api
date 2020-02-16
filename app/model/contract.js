'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const contract = new app.mongoose.Schema({
    address: { type: String, index: { unique: true } },
    creationTransaction: String,
    contractName: String,
    compilerVersion: String,
    // optimization: Boolean,
    status: { type: String, enum: [ 'Active', 'Inactive' ], default: 'Active' },
    abi: String,
    byteCode: String,
    params: [ String ],
    type: { type: String, enum: [ 'favor', 'store', 'other' ], default: 'other' },
    walletEnabled: { type: Boolean, default: false },
    alias: { type: String, default: '' },
  }, {
    collection: 'contract',
  })

  return conn.model('contract', contract)
}
