'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app

  // app
  router.get('/accountBalance', controller.account.getAccountWithBalance)
  router.get('/account/:addr', controller.account.getAccountByAddress)
  router.get('/block/:number', controller.block.getBlockByNumber)
  router.get('/blocks', controller.block.getBlocks)
  router.get('/blockStats', controller.blockStat.getBlockStats)
  router.get('/tx/:hash', controller.transaction.getTransactionByHash)
  router.get('/txs', controller.transaction.getTransactions)
  router.get('/txcount', controller.transaction.getTransactionCount)
  router.get('/favors', controller.favor.getFavors)
  router.get('/favors/posted/:address', controller.favor.getPostedFavors)
  router.get('/favors/assigned/:address', controller.favor.getAssignedFavors)
  router.get('/favors/candidate/:address', controller.favor.getCandidateFavors)
  router.get('/tokens/expense/:address', controller.token.getSpentToken)
  router.get('/tokens/income/:address', controller.token.getEarnedToken)
  router.get('/store/posted/:address', controller.store.getPostedItems)
  router.get('/store/redeem/v2/:address', controller.store.getRedeemItems_v2)
  router.get('/store/items/:status', controller.store.getItemsByStatus)

  router.post('/account/register', controller.account.register)
  router.post('/account/login', controller.account.login)
  router.post('/account/activate/:token', controller.account.activate)

  router.post('/account/heartBeat', app.jwt, controller.account.heartBeat)
  router.post('/account/checkFavorAllowance', app.jwt, controller.account.checkFavorAllowance)
  router.post('/account/checkMarketAllowance', app.jwt, controller.account.checkMarketAllowance)

  router.get('/balance/:addr', app.jwt, controller.account.getTokenBalance)
  router.post('/favor/post', app.jwt, controller.favor.postFavor)
  router.post('/favor/bid', app.jwt, controller.favor.bid)
  router.post('/favor/assign', app.jwt, controller.favor.assign)
  router.post('/favor/complete', app.jwt, controller.favor.complete)
  router.post('/favor/acknowledge', app.jwt, controller.favor.acknowledge)
  router.post('/favor/revertComplete', app.jwt, controller.favor.revertComplete)
  router.post('/favor/cancel', app.jwt, controller.favor.cancel)

  router.post('/store/post', app.jwt, controller.store.postItem)
  router.post('/store/redeem', app.jwt, controller.store.redeem)
  router.post('/store/delivery', app.jwt, controller.store.delivery)
  router.post('/store/confirm', app.jwt, controller.store.confirm)
  router.post('/store/voidItem', app.jwt, controller.store.voidItem)
  router.post('/store/voidRedeem', app.jwt, controller.store.voidRedeem)

  router.get('/contracts', controller.contract.getAllContracts)

  // admin
  router.get('/accounts', app.jwt, controller.account.getAccounts)
  router.get('/accts', app.jwt, controller.account.getAccountNumber)
  router.get('/contract/:address', app.jwt, controller.contract.getContractByAddr)
  router.get('/method', app.jwt, controller.method.getOneByMethodName)
  router.get('/methods/:contract', app.jwt, controller.method.getMethodsByContract)
  router.get('/favor/:favorId', app.jwt, controller.favor.getFavorById)
  router.get('/store/getAll', app.jwt, controller.store.getItems)
  router.get('/store/item/:itemId', app.jwt, controller.store.getItemById)
  router.post('/forceActive', app.jwt, controller.account.forceActive)

  router.post('/deploy', app.jwt, controller.contract.deploy)
  router.post('/sol', app.jwt, controller.solidity.upload)
  router.post('/contract/config/:addr', app.jwt, controller.contract.updateContractConfig)
  router.post('/method/replace', app.jwt, controller.method.replaceMethod)
  router.post('/method/exec', app.jwt, controller.method.execMethod)

  router.post('/favors/approve', app.jwt, controller.favor.approveFavors)
  router.post('/favors/reject', app.jwt, controller.favor.rejectFavors)

  router.post('/store/approve/', controller.store.approveItems)
  router.post('/store/reject', controller.store.rejectItems)

  // unused
  // router.post('/web3/:type', app.jwt, controller.web3.relay)
  // router.get('/domains', controller.account.getDomainList)
  // router.get('/checkAccount/:addr', controller.account.checkAccount)
  // router.get('/addr/:addr', controller.account.getAddr)
  // router.get('/sols', controller.solidity.getAllSolidities)
  // router.get('/sol/:number', controller.solidity.getSolidityById)
  // router.get('/sols/pending', controller.solidity.getPending)
  // router.get('/sols/locked', controller.solidity.getLocked)
  // router.get('/sols/processed', controller.solidity.getProcessed)
  // router.get('/contractName/:name', controller.contract.getContractByName)
  // router.get('/store/redeem/:address', controller.store.getRedeemItems)
  // router.post('/account/appRegister', controller.account.appRegister)
  // router.post('/account/create', controller.account.create)
  // router.post('/account/appLogin', controller.account.appLogin)
  // router.post('/account/delete/:address', controller.account.delete)
  // router.post('/debugTx/:txHash', app.jwt, controller.test.debugTx)
  router.post('/log', controller.log.write)
  // app.io.of('/')
  //   .route('blockTime', io.controller.simple.blockTime)
}
