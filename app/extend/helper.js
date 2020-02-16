'use strict'

const abiDecoder = require('abi-decoder')
const bcrypt = require('bcryptjs')
const etherUnits = require('./etherUnits.js')
const filter = require('./filter.js')
const mail = require('./mail.js')
const moderator = require('./moderator.js')
const _ = require('lodash')

exports.etherUnits = etherUnits
exports.filter = filter
exports.mail = mail
exports.moderator = moderator

exports.getPaging = that => {
  let pageIdx = that.ctx.query.pageIdx ? that.ctx.query.pageIdx : 1
  pageIdx = _.toSafeInteger(pageIdx)
  return {
    pageIdx,
    offset: (pageIdx - 1) * 20,
    limit: 20 + 1,
  }
}

/**
 * Decode input to json if `to` is a contract address
 * @param ctx
 * @param tx
 */
exports.decodeInput = async (ctx, tx) => {
  let inputVal = ''
  // PS: txData.to is null when it's a contract creation transaction
  if (tx.input && tx.to) {
    const contracts = await ctx.model.Contract.find({ address: tx.to })
    if (contracts.length > 0) {
      try {
        const contract = contracts[ 0 ]
        const abi = JSON.parse(contract.abi)
        abiDecoder.addABI(abi)
        inputVal = abiDecoder.decodeMethod(tx.input)
      } catch (ex) {
        ctx.logger.error('Error: Input decode exception')
        ctx.logger.error(ex)
      }
    }
  }
  return JSON.stringify(inputVal)
}

exports.decodeTxReceiptLogs = async (ctx, receipt) => {
  let logs = ''
  if (receipt && receipt.to) {
    const contracts = await ctx.model.Contract.find({ address: receipt.to })
    if (contracts.length > 0) {
      try {
        const contract = contracts[ 0 ]
        const abi = JSON.parse(contract.abi)
        abiDecoder.addABI(abi)
        logs = abiDecoder.decodeLogs(receipt.logs)
      } catch (ex) {
        ctx.logger.error('Error: Input decode exception')
        ctx.logger.error(ex)
      }
    }
  }
  return logs
}

exports.hashString = str => {
  const key = bcrypt.genSaltSync(10)
  const value = bcrypt.hashSync(str, key)
  return {
    key,
    value,
  }
}
exports.hashCheck = (str, hash) => {
  return bcrypt.compareSync(str, hash)
}

exports.isAdmin = async (ctx, addr) => {
  const acc = await ctx.service.account.getAccountByAddress(addr)
  return acc.isAdmin === true
}

