'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const account = new app.mongoose.Schema({
    address: { type: String, index: { unique: true }, required: true },
    name: { type: String, required: true },
    avatarId: Number,
    pwcMail: { type: String, unique: true, dropDups: true, required: true },
    domain: { type: String, enum: [ 'IMAT', 'ORACLE', 'SAP', 'SALESFORCE', 'MICROSOFT', 'CHINA&JAPAN', 'GUIDEWIRE', 'IFS', 'ADT', 'RC&MC' ], required: true },
    status: { type: String, enum: [ 'Created', 'Active', 'Inactive' ], default: 'Created' },
    activateToken: String,
    balance: { type: String, default: 0 },
    createTime: { type: Date, default: Date.now },
    updatedAt: Date,
    tokenExpireTime: { type: Date, default: () => { return +new Date() + 1 * 24 * 60 * 60 * 1000 } },
    keystore: { type: String },
    isAdmin: { type: Boolean, default: false },
  }, {
    collection: 'account',
  })

  return conn.model('account', account)
}
