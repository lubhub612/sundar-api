'use strict'

const _ = require('lodash')

module.exports = app => {
  class LogService extends app.Service {

    async write(log) {
      await new this.ctx.model.Log(log).save()
    }
  }
  return LogService
}
