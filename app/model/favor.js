'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const favor = new app.mongoose.Schema({
    id: { type: Number, index: { unique: true } },
    status: String,
    reward: Number,
    name: String,
    description: String,
    postedBy: String,
    assignees: [ String ],
    candidates: [ String ],
  }, {
    collection: 'favor',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  })

  favor.virtual('poster', {
    ref: 'account', // The model to use
    localField: 'postedBy', // Find people where `localField`
    foreignField: 'address', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: true,
  })

  favor.virtual('assigneeList', {
    ref: 'account',
    localField: 'assignees',
    foreignField: 'address',
    justOne: false,
  })

  favor.virtual('candidateList', {
    ref: 'account',
    localField: 'candidates',
    foreignField: 'address',
    justOne: false,
  })

  favor.set('toObject', { virtuals: true })
  favor.set('toJSON', { virtuals: true })

  favor.index({ id: 1, createdAt: -1 })

  return conn.model('favor', favor)
}
