'use strict'

const WEB3 = Symbol('Application#WEB3')
const WEB3P = Symbol('Application#WEB3P')
const WEB3ACCOUNT = Symbol('Application#WEB3ACCOUNT')
const Web3 = require('web3')
const Web3Account = require('web3-eth-accounts')

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  )

// simple proxy to promisify the web3 api. It doesn't deal with edge cases like web3.eth.filter and contracts.
const proxiedWeb3Handler = {
  // override getter
  get: (target, name) => {
    const inner = target[ name ]
    if (inner instanceof Function) {
      // Return a function with the callback already set
      return (...args) => promisify(cb => inner(...args, cb))
    } else if (typeof inner === 'object') {
      // wrap inner web3 stuff
      return new Proxy(inner, proxiedWeb3Handler)
    }
    return inner
  },
}

// app/extend/application.js
module.exports = {
  get web3() {
    if (!this[ WEB3 ]) {
      const nodeAddr = this.config.chain.nodeAddr
      const gethPort = this.config.chain.gethPort
      const web3 = new Web3(new Web3.providers.HttpProvider('http://' + nodeAddr + ':' + gethPort))
      this[ WEB3 ] = web3
    }
    return this[ WEB3 ]
  },
  get web3p() {
    if (!this[ WEB3P ]) {
      const web3p = new Proxy(this.web3, proxiedWeb3Handler)
      this[ WEB3P ] = web3p
    }
    return this[ WEB3P ]
  },
  get web3account() {
    if (!this[ WEB3ACCOUNT ]) {
      const nodeAddr = this.config.chain.nodeAddr
      const gethPort = this.config.chain.gethPort
      const web3Account = new Web3Account(new Web3.providers.HttpProvider('http://' + nodeAddr + ':' + gethPort))
      this[ WEB3ACCOUNT ] = web3Account
    }
    return this[ WEB3ACCOUNT ]
  },
}
