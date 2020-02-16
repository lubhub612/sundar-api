'use strict'

module.exports = app => {
  class FavorService extends app.Service {
    async save(favor) {
      return await new this.ctx.model.Favor(favor).save()
    }

    async upsert(favor) {
      return await this.ctx.model.Favor.findOneAndUpdate({ id: favor.id }, favor, { upsert: true })
    }

    async getFavors() {
      return await this.ctx.model.Favor.find({})
        .sort([[ 'createdAt', -1 ]])
        .populate({ path: 'poster', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'assigneeList', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'candidateList', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async getPostedFavors(address) {
      return await this.ctx.model.Favor.find({ postedBy: address })
        .sort([[ 'createdAt', -1 ]])
        .populate({ path: 'poster', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'assigneeList', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'candidateList', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async getAssignedFavors(address) {
      return await this.ctx.model.Favor.find({ assignees: address })
        .sort([[ 'createdAt', -1 ]])
        .populate({ path: 'poster', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'assigneeList', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'candidateList', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async getCandidateFavors(address) {
      return await this.ctx.model.Favor.find({ candidates: address })
        .sort([[ 'createdAt', -1 ]])
        .populate({ path: 'poster', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'assigneeList', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'candidateList', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async getFavorByStatus(status) {
      return await this.ctx.model.Favor.find({ status })
        .sort('id')
    }

    async getFavorById(id) {
      return await this.ctx.model.Favor.findOne({ id })
        .populate({ path: 'poster', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'assigneeList', select: 'address name pwcMail domain avatarId' })
        .populate({ path: 'candidateList', select: 'address name pwcMail domain avatarId' })
        .exec()
    }

    async saveFavorEvents(favorEvents, address) {
      let favorId = 0

      favorEvents.forEach(event => {
        if (event.name === 'favorId') {
          favorId = event.value
        }
      })
      const contractInstance = await this.ctx.service.contract.getContractOnChain(address)
      const resultArray = await contractInstance.getFavor(favorId)
      const candidatesArray = await contractInstance.getBidders(favorId)

      const favor = {
        id: resultArray[ 0 ].toNumber(),
        status: resultArray[ 1 ],
        reward: resultArray[ 2 ].toNumber(),
        name: resultArray[ 3 ],
        description: resultArray[ 4 ],
        postedBy: resultArray[ 5 ],
        assignees: resultArray[ 6 ],
        candidates: candidatesArray,
      }

      const result = await this.upsert(favor)
      if (result) {
        this.ctx.logger.info('Successfully saved favor: ' + result.id)
      }

      if (favor.status.toLowerCase() === 'pending') {
        const textContent = favor.name + ' ' + favor.description
        const moderateResult = await this.ctx.helper.moderator.checkText(this.ctx, textContent)
        const score1 = moderateResult.Classification.Category1.Score
        const score2 = moderateResult.Classification.Category2.Score
        const score3 = moderateResult.Classification.Category3.Score
        const baseScore = this.ctx.app.config.azure_moderator.score

        if (score1 < baseScore && score2 < baseScore && score3 < baseScore) {
          const acc = await this.ctx.service.account._getAccountByAddress(this.config.chain.defaultCoinbase)
          const keystore = JSON.parse(acc.keystore)
          const decryptedAccount = await this.app.web3account.decrypt(keystore, this.config.chain.defaultPwd)
          await this.ctx.service.method.execMethodByAccount(
            decryptedAccount,
            'Favor.sol:FavorExchange',
            'approveFavor',
            { 0: favor.id }
          )
        }
      }
      return favor
    }

    async postFavor(account, favor) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)
      const postResult = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'postFavor',
        favor
      )
      return postResult
    }

    async bid(account, favorId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'bid',
        params
      )
    }

    async assign(account, favorId, addresses) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
        1: addresses,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'addAssignee',
        params
      )
      return result
    }

    async complete(account, favorId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'completeFavor',
        params
      )
      return result
    }

    async revertComplete(account, favorId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'revertCompleteFavor',
        params
      )
      return result
    }

    async acknowledge(account, favorId, addresses, rewards) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
        1: addresses,
        2: rewards,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'acknowledgeFavor',
        params
      )
      return result
    }

    async cancel(account, favorId) {
      const keystore = JSON.parse(account.keystore)
      const decryptedAccount = await this.app.web3account.decrypt(keystore, account.passphrase)

      const params = {
        0: favorId,
      }
      const result = await this.ctx.service.method.execMethodByAccount(
        decryptedAccount,
        'Favor.sol:FavorExchange',
        'cancelFavor',
        params
      )
      return result
    }
  }

  return FavorService
}
