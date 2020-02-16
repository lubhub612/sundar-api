'use strict'

const Controller = require('egg').Controller
const _ = require('lodash')
const crypto = require('crypto')

class TestController extends Controller {

  async test1() {
    const acc1 = await this.app.web3account.create()
    const acc2 = await this.app.web3account.privateKeyToAccount(acc1.privateKey)
    this.ctx.body = {
      data: {
        acc1,
        acc2,
      },
    }
  }

  async test2() {
    // const keystore = { address: '03dc685491f13f0fc530fb038094bcce5c6da98f', crypto: { cipher: 'aes-128-ctr', ciphertext: '646e4bc7c1e98b306c70806bdc161b8c3ebe7f7ef01f0448bee47964d5a06c2a', cipherparams: { iv: '0dff684d99454a61c48468a08a514c0f' }, kdf: 'scrypt', kdfparams: { dklen: 32, n: 262144, p: 1, r: 8, salt: '6794dae083c73b268e3dedd288177cf05c4d230039f25045da3cec146ee84e56' }, mac: '1c1b243ac7fe8c279d3181cc8bb5a755de300303138dbfc44e4264f1dff85c17' }, id: '279453d1-f454-46f9-a275-b1f7b376a23e', version: 3 }
    // const passphrase = "Mhb7wHGY3XGdKCzd"

    const keystore = {
      address: '7ebdc9328ba609e4fd2f7784938df8616c874ef5',
      crypto: {
        cipher: 'aes-128-ctr',
        ciphertext: '7cf9025de9295ea87425dbdef0100e3194c8634be1d9f7a97324fd24a9ce2cca',
        cipherparams: { iv: '88db7f53d15e044f519d262a65cf87c5' },
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          n: 4096,
          p: 6,
          r: 8,
          salt: 'dd853fb38dd3405b87251c4ce24aaed37068144d0e382ac6f7034d0c391adb97',
        },
        mac: 'be700a789484888a535e6fd76bd2ca4509c2c4e2eaf450ae1496f3685feef792',
      },
      id: 'aa4822cd-a874-456c-9a13-5dfb04652420',
      version: 3,
    }
    const passphrase = 'Pwcwelcome1'
    const decryptedAccount = await this.app.web3account.decrypt(keystore, passphrase)
    this.ctx.body = {
      data: {
        decryptedAccount,
      },
    }
  }

  async test3() {
    const acc1 = await this.app.web3account.create()
    const keystore = await this.app.web3account.encrypt(acc1.privateKey, 'Pwcwelcome1')
    const decryptedAccount = await this.app.web3account.decrypt(keystore, 'Pwcwelcome1')
    this.ctx.body = {
      data: {
        acc1,
        keystore,
        decryptedAccount,
      },
    }
  }

  async test4() {
    /*
    // Sample request body
    {
        "method": {
            "contract": "Favor.sol:FavorExchange",
            "name": "postFavor"
        },
        "params": {
            "_reward": 10,
            "_description": "Do not apply me ...",
            "_name": "Testing 01 12/07/2010"
        }
    }
     */
    const { method, params } = this.ctx.request.body
    const keystore = {
      address: '7ebdc9328ba609e4fd2f7784938df8616c874ef5',
      crypto: {
        cipher: 'aes-128-ctr',
        ciphertext: '7cf9025de9295ea87425dbdef0100e3194c8634be1d9f7a97324fd24a9ce2cca',
        cipherparams: { iv: '88db7f53d15e044f519d262a65cf87c5' },
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          n: 4096,
          p: 6,
          r: 8,
          salt: 'dd853fb38dd3405b87251c4ce24aaed37068144d0e382ac6f7034d0c391adb97',
        },
        mac: 'be700a789484888a535e6fd76bd2ca4509c2c4e2eaf450ae1496f3685feef792',
      },
      id: 'aa4822cd-a874-456c-9a13-5dfb04652420',
      version: 3,
    }
    const passphrase = 'Pwcwelcome1'
    const decryptedAccount = await this.app.web3account.decrypt(keystore, passphrase)
    const contract = await this.ctx.service.contract.getContractByName(method.contract)
    const eContract = this.app.web3.eth.contract(JSON.parse(contract.abi))
    const eContractInstance = eContract.at(contract.address)
    const prms = params ? Object.values(params) : []
    const data = eContractInstance[ method.name ].getData(...prms)
    const tx = {
      from: decryptedAccount.address,
      to: contract.address,
      gas: 4700000,
      data,
    }
    const signed = await decryptedAccount.signTransaction(tx)
    const txHash = await this.app.web3p.eth.sendRawTransaction(signed.rawTransaction)
    // tran.on('confirmation', (confirmationNumber, receipt) => {
    //   console.log('confirmation: ' + confirmationNumber)
    // })
    // tran.on('transactionHash', hash => {
    //   console.log('hash')
    //   console.log(hash)
    // })
    // tran.on('receipt', receipt => {
    //   console.log('reciept')
    //   console.log(receipt)
    // })
    // tran.on('error', console.error)
    this.ctx.body = {
      data: {
        decryptedAccount,
        data,
        signed,
        txHash,
      },
    }
  }

  async debugTx() {
    const { txHash } = this.ctx.params
    const receipt = await this.app.web3.eth.getTransactionReceipt(txHash)
    const logs = await this.ctx.helper.decodeTxReceiptLogs(this.ctx, receipt)
    this.ctx.body = {
      data: {
        receipt,
        logs,
      },
    }
  }
}

module.exports = TestController
