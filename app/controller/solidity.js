'use strict'

const Controller = require('egg').Controller
const toArray = require('stream-to-array')
const solc = require('solc')

class SolidityController extends Controller {

  async upload() {
    const token = this.ctx.header.authorization
    const payload = this.app.jwt.verify(token.split(' ')[ 1 ], this.app.config.jwt.secret)
    const isAdmin = await this.ctx.helper.isAdmin(this.ctx, payload.address)
    if (isAdmin === true) {
      const stream = await this.ctx.getFileStream()
      if (!stream.truncated) {
        const name = stream.filename
        // const fields = stream.fields
        const parts = await toArray(stream)
        const buffer = Buffer.concat(parts)
        // const base64data = buffer.toString('base64')
        const sol = {
          name,
          data: buffer,
          status: 'pending',
          metadata: '',
        }
        await this.ctx.service.solidity.write(sol)
        let contracts = await this._compile(sol)
        contracts = contracts.filter(c => c.name.match(stream.filename))
        contracts.forEach(contract => {
          contract.constructor = this._extractFunctions(contract)
        })
        this.ctx.body = contracts
        this.ctx.status = 200
      }
    } else {
      this.ctx.status = 401
      this.ctx.body = {
        message: 'Unauthorized',
      }
    }
  }

  async getAllSolidities() {
    let sols = await this.ctx.service.solidity.getAllSolidities()
    sols = sols.map(sol => {
      sol.text = sol.data.toString('utf8')
      return sol
    })
    this.ctx.body = sols
    this.ctx.status = 200
  }

  async getSolidityById() {
    const id = this.ctx.params.number
    const sol = await this.ctx.service.solidity.getSolidityById(id)
    sol.text = sol.data.toString('utf8')
    this.ctx.body = sol
    this.ctx.status = 200
  }

  async getPending() {
    let sols = await this.ctx.service.solidity.getPending()
    sols = sols.map(sol => {
      sol.text = sol.data.toString('utf8')
      return sol
    })
    this.ctx.body = sols
    this.ctx.status = 200
  }

  async getLocked() {
    let sols = await this.ctx.service.solidity.getLocked()
    sols = sols.map(sol => {
      sol.text = sol.data.toString('utf8')
      return sol
    })
    this.ctx.body = sols
    this.ctx.status = 200
  }

  async getProcessed() {
    let sols = await this.ctx.service.solidity.getProcessed()
    sols = sols.map(sol => {
      sol.text = sol.data.toString('utf8')
      return sol
    })
    this.ctx.body = sols
    this.ctx.status = 200
  }

  async deploy() {
    const { id, params } = this.ctx.request.body
    const sol = await this.service.solidity.getSolidityById(id)
    if (sol.status === 'locked') {
      const err = new Error('This contract is being processed.')
      err.status = 409
      throw err
    } else if (sol.status === 'processed') {
      const err = new Error('This contract is already on chain.')
      err.status = 409
      throw err
    }
    await this.ctx.service.solidity.updateStatus(id, 'locked')
    sol.text = sol.data.toString('utf-8')
    const mtdt = await this._compile(sol)
    // console.log(mtdt)
    await this.ctx.service.solidity.update(id, { metadata: JSON.stringify(mtdt) })

  }

  async _compile(sol) {
    const input = {}
    input[ sol.name ] = this._parseSol(sol.data)
    const imports = await this._findImport(input[ sol.name ])
    const compiled = solc.compile({ sources: input }, 1, path => {
      if (imports[ path ]) {
        return { contents: imports[ path ] }
      }
      else {
        return { error: 'File not found' }
      }
    })
    const contracts = []
    Object.keys(compiled.contracts)
      .forEach(key => {
        contracts.push({
          name: key,
          abi: compiled.contracts[ key ].interface,
          binary: compiled.contracts[ key ].bytecode,
        })
      })
    return contracts
  }

  _parseSol(data) {
    return data.toString('utf-8')
      .replace(/\/\/ ?.*/g, '')
      .replace(/\n/g, ' ')
  }

  async _findImport(data) {
    let names = []
    const stms = data.match(/import ".*?sol";/g)
    if (!stms) {
      return {}
    }
    stms.forEach(stm => {
      names.push(stm.match(/[a-zA-Z]*.sol/)[ 0 ])
    })
    const ctx = this.app.createAnonymousContext()
    const files = await ctx.service.solidity.getMultipleSolidityByName(names)
    const imports = {}
    files.forEach(file => {
      imports[ file.name ] = this._parseSol(file.data)
    })
    return imports
  }

  _extractFunctions(contract) {
    const methods = JSON.parse(contract.abi.replace(/\\/g, ''))
    let constructor = ''
    methods.forEach(method => {
      this.ctx.service.method.write({
        ...method,
        contract: contract.name,
      })
      if (method.type === 'constructor') {
        constructor = {
          ...method,
          contractName: contract.name,
        }
      }
    })
    return constructor
  }
}

module.exports = app => SolidityController
