'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const redeem = new app.mongoose.Schema({
    itemId: Number,
    redeemBy: String,
    status: String,
    index: Number,
  }, {
    collection: 'redeem',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  })

  redeem.virtual('purchaser', {
    ref: 'account', // The model to use
    localField: 'redeemBy', // Find people where `localField`
    foreignField: 'address', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: true,
  })

  redeem.virtual('item', {
    ref: 'item',
    localField: 'itemId',
    foreignField: 'itemId',
    justOne: true,
  })

  redeem.set('toObject', { virtuals: true })
  redeem.set('toJSON', { virtuals: true })

  redeem.index({ itemId: 1, index: 1, createdAt: -1 })

  return conn.model('redeem', redeem)
}
