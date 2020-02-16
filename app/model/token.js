'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const token = new app.mongoose.Schema({
    from: String,
    to: String,
    amount: Number,
    timestamp: String,
    title: String,
    type: String,
  }, {
    collection: 'token',
  })

  token.virtual('payer', {
    ref: 'account',
    localField: 'from',
    foreignField: 'address',
    justOne: true,
  })

  token.virtual('payee', {
    ref: 'account',
    localField: 'to',
    foreignField: 'address',
    justOne: true,
  })

  token.set('toObject', { virtuals: true })
  token.set('toJSON', { virtuals: true })

  token.index({ timestamp: -1 })
  return conn.model('token', token)
}
