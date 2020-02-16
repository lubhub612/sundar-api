'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const item = new app.mongoose.Schema({
    itemId: { type: Number, index: { unique: true } },
    status: String,
    unitPrice: Number,
    title: String,
    description: String,
    postedBy: String,
    availableUnit: Number,
    counter: Number,
    repeatable: Boolean,
  }, {
    collection: 'item',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  })

  item.virtual('vendor', {
    ref: 'account', // The model to use
    localField: 'postedBy', // Find people where `localField`
    foreignField: 'address', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: true,
  })

  item.virtual('redeems', {
    ref: 'redeem',
    localField: 'itemId',
    foreignField: 'itemId',
  })

  item.set('toObject', { virtuals: true })
  item.set('toJSON', { virtuals: true })

  item.index({ itemId: 1, createdAt: -1 })
  return conn.model('item', item)
}
