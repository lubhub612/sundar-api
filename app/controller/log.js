'use strict'

const Controller = require('egg').Controller
const _ = require('lodash')

class LogController extends Controller {

  async write() {
    const log = this.ctx.request.body
    await this.ctx.service.log.write(log)
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
    }
  }
}

module.exports = LogController
