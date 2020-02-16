'use strict'

module.exports = app => {
  const conn = app.mongooseDB.get('blockDB')
  const log = new app.mongoose.Schema({
    account: { type: String },
    from: { type: String },
    source: { type: String },
    content: { type: String },
    createTime: { type: Date, default: Date.now },
  }, {
    collection: 'log',
  })

  return conn.model('log', log)
}
