'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const paramSchema = new app.mongoose.Schema({
    name: { type: String },
    type: { type: String },
    component: { type: String },
    alias: { type: String, default: '' },
    defaultParam: { type: Array },
  })
  const method = new app.mongoose.Schema({
    name: { type: String },
    type: { type: String, enum: [ 'function', 'constructor', 'fallback', 'event' ], default: 'function' },
    payable: { type: Boolean, default: false },
    stateMutability: { type: String, enum: [ 'pure', 'view', 'nonpayable', 'payable' ] },
    constant: { type: Boolean },
    inputs: { type: [ paramSchema ] },
    outputs: { type: [ paramSchema ] },
    contract: { type: String },
    alias: { type: String, default: '' },
    status: { type: String, enum: [ 'Pending', 'Active', 'Inactive' ], default: 'Pending' },
  }, {
    collection: 'method',
  })

  return conn.model('method', method)
}
