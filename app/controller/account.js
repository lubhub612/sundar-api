'use strict'

const Controller = require('egg').Controller
const _ = require('lodash')
const crypto = require('crypto')

class AccountController extends Controller {

  async checkAccount() {
    const addr = this.ctx.params.addr
    const accounts = await this.app.web3p.eth.accounts
    const idx = _.findIndex(accounts, function(o) {
      return o === addr
    })
    if (idx > -1) {
      this.ctx.body = true
      this.status = 200
    }
  }

  async checkFavorAllowance() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    const keystore = JSON.parse(account.keystore)
    const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
    const accountBalance = await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'balanceOf',
      { 0: payload.address },
      payload.address)
    const favorContract = await this.ctx.service.contract.getContractByName('Favor.sol:FavorExchange')
    const favorAllowance = await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'allowance',
      {
        0: payload.address,
        1: favorContract.address,
      },
      payload.address)
    const a = accountBalance.c[ 0 ]
    const f = favorAllowance.c[ 0 ]
    let favorAllowanceRes = {}
    if (f !== a) {
      const favorAllowanceParams = {
        _spender: favorContract.address,
        _value: a,
      }
      favorAllowanceRes = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Token.sol:MyAdvancedToken',
        'approve',
        favorAllowanceParams
      )
    }
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
      favorAllowanceRes,
      a,
      f,
    }
  }

  async checkMarketAllowance() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const account = await this.ctx.service.account._getAccountByAddress(payload.address)
    const keystore = JSON.parse(account.keystore)
    const decryptedAccount = await this.app.web3account.decrypt(keystore, payload.passphrase)
    const accountBalance = await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'balanceOf',
      { 0: payload.address },
      payload.address)
    const marketContract = await this.ctx.service.contract.getContractByName('Market.sol:MarketExchange')
    const marketAllowance = await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'allowance',
      {
        0: payload.address,
        1: marketContract.address,
      },
      payload.address)
    const a = accountBalance.c[ 0 ]
    const m = marketAllowance.c[ 0 ]
    let marketAllowanceRes = {}
    if (m !== a) {
      const marketAllowanceParams = {
        _spender: marketContract.address,
        _value: a,
      }
      marketAllowanceRes = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Token.sol:MyAdvancedToken',
        'approve',
        marketAllowanceParams
      )
    }
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
      marketAllowanceRes,
      a,
      m,
    }
  }

  async getBalance() {
    const addr = this.ctx.params.addr
    const balance = await this.app.web3p.eth.getBalance(addr)
    this.ctx.body = balance
    this.ctx.status = 200
  }

  async getTokenBalance() {
    const addr = this.ctx.params.addr
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    const balance = await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'balanceOf',
      { 0: addr },
      payload.address)

    this.ctx.body = balance
    this.ctx.status = 200
  }

  async getAccountNumber() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      this.ctx.body = await this.ctx.service.account.getAccountNumber()
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getAddr() {
    const addr = this.ctx.params.addr
    const paging = this.ctx.helper.getPaging(this)
    const data = {}
    data.transactions = await this.ctx.service.transaction.getTransactionByAccountAddress(addr, paging.offset, paging.limit)
    data.count = await this.ctx.service.transaction.countTransactionByAccountAddress(addr)
    data.mined = await this.ctx.service.block.countBlockByAccountAddress(addr)
    this.ctx.body = data
    this.ctx.status = 200
  }

  async create() {
    const userInfo = this.ctx.request.body
    if (await this.ctx.service.account.getAccountByMail(userInfo.pwcMail.toLowerCase())) {
      this.ctx.logger.info(`Invalid acc create: ${JSON.stringify(userInfo)}`)
      const err = new Error('Mail account already exist.')
      err.status = 409
      throw err
    }

    const account = {
      address: userInfo.address.toLowerCase(),
      name: userInfo.name ? userInfo.name : '',
      pwcMail: userInfo.pwcMail.toLowerCase(),
      domain: userInfo.domain,
      avatarId: userInfo.avatarId,
      keystore: userInfo.keystore,
      isAdmin: false,
    }
    account.activateToken = await this._crypto(account.name, Date.now()
      .toString())
    await this.ctx.service.account.create(account)
    await this._sendMail(account.pwcMail, account.activateToken)
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
    }
  }

  async appRegister() {
    const userInfo = this.ctx.request.body
    if (await this.ctx.service.account.getAccountByMail(userInfo.pwcMail.toLowerCase())) {
      this.ctx.logger.info(`Invalid acc create: ${JSON.stringify(userInfo)}`)
      const err = new Error('Mail account already exist.')
      err.status = 409
      throw err
    }
    const passphrase = userInfo.passphrase
    const web3Account = await this.app.web3account.create()
    const keystore = await this.app.web3account.encrypt(web3Account.privateKey, passphrase)

    const account = {
      address: web3Account.address.toLowerCase(),
      name: userInfo.name ? userInfo.name : '',
      pwcMail: userInfo.pwcMail.toLowerCase(),
      domain: userInfo.domain,
      avatarId: userInfo.avatarId,
      keystore: JSON.stringify(keystore),
      isAdmin: false,
    }
    account.activateToken = await this._crypto(account.name, Date.now()
      .toString())
    await this.ctx.service.account.create(account)
    await this._sendMail(account.pwcMail, account.activateToken)
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
    }
  }

  async register() {
    const userInfo = this.ctx.request.body
    if (await this.ctx.service.account.getAccountByMail(userInfo.pwcMail.toLowerCase())) {
      this.ctx.logger.info(`Invalid acc create: ${JSON.stringify(userInfo)}`)
      const err = new Error('Mail account already exist.')
      err.status = 409
      throw err
    }

    const tmp = userInfo.pwcMail.toLowerCase()
      .replace('@pwc.com', '')
    if (/[^a-zA-Z\.]/.test(tmp)) {
      this.ctx.logger.info(`Invalid acc create: ${JSON.stringify(userInfo)}`)
      const err = new Error('Invalid email address.')
      err.status = 409
      throw err
    }

    const passphrase = userInfo.passphrase
    const web3Account = await this.app.web3account.create()
    const keystore = await this.app.web3account.encrypt(web3Account.privateKey, passphrase)

    const account = {
      address: web3Account.address.toLowerCase(),
      name: userInfo.name ? userInfo.name : '',
      pwcMail: userInfo.pwcMail.toLowerCase(),
      domain: userInfo.domain,
      avatarId: userInfo.avatarId,
      keystore: JSON.stringify(keystore),
      isAdmin: false,
    }
    account.activateToken = await this._crypto(account.name, Date.now()
      .toString())
    await this.ctx.service.account.create(account)
    await this._sendMail(account.pwcMail, account.activateToken)
    this.ctx.status = 200
    this.ctx.body = {
      success: true,
    }
  }

  async delete() {
    const address = this.ctx.params.address
    const user = await this.ctx.service.account.getAccountByAddress(address)
    if (!user) {
      const err = new Error('No matching doc found in db')
      err.status = 409
      throw err
    }
    this.ctx.status = 200
    this.ctx.body = {
      success: await this.ctx.service.account.deleteByAddress(address),
    }
  }

  async activate() {
    const token = this.ctx.params.token
    const userInfo = await this.ctx.service.account.putStatusByToken(token, 'Active')
    if (!userInfo) {
      const err = new Error('No matching doc found in db')
      err.status = 409
      throw err
    } else if (userInfo.status === 'Active') {
      const err = new Error('This account has already been activated.')
      err.status = 409
      throw err
    } else if (userInfo.status === 'Inactive') {
      await this.ctx.service.account.putStatusByToken(token, 'Inactive')
      const err = new Error('Activating a frozen account is not allowed.')
      err.status = 409
      throw err
    } else if (Date.now() > userInfo.tokenExpireTime) {
      await this.ctx.service.account.putStatusByToken(token, 'Created')
      userInfo.activateToken = await this._crypto(userInfo.name, Date.now()
        .toString())
      userInfo.tokenExpireTime = new Date().setDate(new Date().getDate() + 1)
      await this.ctx.service.account.updateActivateToken(userInfo.address, userInfo.activateToken, userInfo.tokenExpireTime)
      await this._sendMail(userInfo.pwcMail, userInfo.activateToken)
      const err = new Error('Token has expired. A new verify mail has been sent.')
      err.status = 409
      throw err
    }
    await this.ctx.service.account.deleteActivateToken(userInfo.address)
    this.ctx.body = {
      success: await this._newAccountSetup(userInfo.address),
    }
    this.ctx.status = 200
  }

  async _newAccountSetup(account) {
    await this.ctx.service.account.unlockAccount()

    // const acc = await this.ctx.service.account._getAccountByAddress(this.config.chain.defaultCoinbase)
    // const keystore = JSON.parse(acc.keystore)
    // const decryptedAccount = await this.app.web3account.decrypt(keystore, this.config.chain.defaultPwd)

    await this.ctx.service.method.execMethod(
      'EthFaucet.sol:EthFaucet',
      'getEth',
      { 0: account },
      this.config.chain.defaultCoinbase)
    await this.ctx.service.method.execMethod(
      'Token.sol:MyAdvancedToken',
      'mintToken',
      {
        0: account,
        1: 1000,
      },
      this.config.chain.defaultCoinbase)
    return true
  }

  async getAccounts() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const skip = this.ctx.query.start ? parseInt(this.ctx.query.start) : 0
      const limit = this.ctx.query.amount ? parseInt(this.ctx.query.amount) : 25
      const { status } = this.ctx.query
      if (status) {
        this.ctx.body = await this.ctx.service.account.getAccountsByStatus(status, skip, limit)
      } else {
        this.ctx.body = await this.ctx.service.account.getAccounts(skip, limit)
      }
      this.ctx.status = 200
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getAccountWithBalance() {
    const accounts = await this.ctx.service.account.getAllAccounts()
    const pAccounts = accounts.map(async acc => {
      const earns = await this.ctx.service.token.getEarnedToken(acc.address)
      const spents = await this.ctx.service.token.getSpentToken(acc.address)
      const earnAmt = _.sumBy(earns, function(o) {
        return o.amount
      })
      const spentAmt = _.sumBy(spents, function(o) {
        return o.amount
      })
      acc.earn = earnAmt
      acc.spent = spentAmt
      acc.balance = earnAmt - spentAmt
      return acc
    })
    const result = await Promise.all(pAccounts)
    const ranks = result.sort((a, b) => {
      const balanceA = parseInt(a.balance)
      const balanceB = parseInt(b.balance)
      if (balanceA < balanceB) return 1
      if (balanceA > balanceB) return -1
      return 0
    })
    const top = _.slice(ranks, 0, 10)
    this.ctx.body = top
    this.ctx.status = 200
  }

  async getAccountByAddress() {
    const address = this.ctx.params.addr
    this.ctx.body = await this.ctx.service.account.getAccountByAddress(address)
    this.ctx.status = 200
  }

  async getDomainList() {
    this.ctx.body = await this.ctx.service.account.getDomainList()
    this.ctx.status = 200
  }

  async _crypto(...args) {
    const hash = crypto.createHash('sha256')
    args.forEach(arg => {
      hash.update(arg)
    })
    return hash.digest('hex')
  }

  async _sendMail(address, token) {
    this.ctx.helper.mail.sendMail(this.ctx, address, token)
  }

  async heartBeat() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const account = await this.ctx.service.account.getAccountByAddress(payload.address)
    const newToken = {
      address: payload.address,
      passphrase: payload.passphrase,
    }
    this.ctx.status = 200
    this.ctx.body = {
      jwt: this.app.jwt.sign(newToken, this.app.config.jwt.secret, { expiresIn: 1800000 }), // ms
      email: account.pwcMail,
      address: account.address,
      isAdmin: account.isAdmin,
      name: account.name,
      avatarId: account.avatarId,
      domain: account.domain,
    }
  }

  async login() {
    const passphrase = this.ctx.request.body.passphrase
    const email = this.ctx.request.body.email

    const account = await this.ctx.service.account._getAccountByMail(email)
    if (account) {
      if (account.status === 'Active') {
        const decryptedAccount = await this.app.web3account.decrypt(JSON.parse(account.keystore), passphrase)
        if (decryptedAccount && decryptedAccount.address.toLowerCase() === account.address) {
          const token = {
            address: account.address,
            passphrase,
          }

          this.ctx.status = 200
          this.ctx.body = {
            jwt: this.app.jwt.sign(token, this.app.config.jwt.secret, { expiresIn: 1800000 }), // ms
            email,
            address: account.address,
            isAdmin: account.isAdmin,
            name: account.name,
            avatarId: account.avatarId,
            domain: account.domain,
          }
        } else {
          this.ctx.status = 401
          this.ctx.body = {
            message: 'Unauthorized',
          }
        }
      } else {
        this.ctx.status = 401
        this.ctx.body = {
          message: 'Unauthorized',
        }
      }
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async appLogin() {
    const passphrase = this.ctx.request.body.passphrase
    const email = this.ctx.request.body.email

    const account = await this.ctx.service.account._getAccountByMail(email)
    if (account) {
      const decryptedAccount = await this.app.web3account.decrypt(JSON.parse(account.keystore), passphrase)
      if (decryptedAccount && decryptedAccount.address.toLowerCase() === account.address) {

        this.ctx.status = 200
        this.ctx.body = {
          keystore: account.keystore,
          address: account.address,
        }
      } else {
        this.ctx.status = 401
        this.ctx.body = {
          message: 'Unauthorized',
        }
      }
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async forceActive() {
    const targetAccountAddr = this.ctx.request.body.targetAddr
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)

    if (payload) {
      const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
      if (isAdmin === true) {
        if (targetAccountAddr) {
          const userAccount = await this.ctx.service.account.getAccountByAddress(payload.address)
          userAccount.passphrase = payload.passphrase

          const targetAccount = await this.ctx.service.account.getAccountByAddress(targetAccountAddr)
          if (userAccount && userAccount.isAdmin &&
            targetAccount && targetAccount.status === 'ForceActive') {

            await this.ctx.service.account.updateStatus(targetAccountAddr, 'Active')
            await this.ctx.service.account.unlockAccount(payload.address, payload.passphrase)
            await this.ctx.service.method.execMethod(
              'EthFaucet.sol:EthFaucet',
              'getEth',
              { 0: targetAccountAddr },
              payload.address)
            await this.ctx.service.method.execMethod(
              'Token.sol:MyAdvancedToken',
              'mintToken',
              {
                0: targetAccountAddr,
                1: 1000,
              },
              payload.address)
            this.ctx.status = 200
          } else {
            this.ctx.status = 500
            this.ctx.body = {
              message: 'Invalid action',
            }
          }
        } else {
          this.ctx.status = 500
          this.ctx.body = {
            message: 'Missing targetAddr',
          }
        }
      } else {
        this.ctx.status = 401
        this.ctx.body = {
          message: 'Unauthorized',
        }
      }
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }
}

module
  .exports = AccountController
