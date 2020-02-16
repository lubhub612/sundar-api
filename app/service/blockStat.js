'use strict'

const _ = require('lodash')

module.exports = app => {
  class BlockStatService extends app.Service {

    async getBlockStats(limit) {
      const bs = await this.ctx.model.BlockStat.find({})
        .lean(true)
        .sort('-number')
        .limit(limit)
      return bs
    }
  }

  return BlockStatService
}
