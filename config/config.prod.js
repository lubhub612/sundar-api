'use strict'
const exec = require('child_process').exec
const path = require('path')

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1534488243843_8872'

  // add your config here
  config.middleware = [ 'errorHandler' ]

  config.mongoose = {
    clients: {
      blockDB: {
        url: 'mongodb://drip:3eu]A8mmWyfXu"RS@168.62.38.213:27017/Drop',
        options: {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
        },
      },
    },
  }

  let solcVersion = '0.4.25'
  exec('npm view solc version', (error, sdout) => {
    if (error) {
      console.error(error)
      return
    }
    solcVersion = sdout
  })

  exports.compilerVersion = solcVersion

  // config/config.default.js
  exports.security = {
    csrf: {
      enable: false,
    },
    xframe: {
      enable: false,
    },
    hsts: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
    noopen: {
      enable: false,
    },
    nosniff: {
      enable: false,
    },
    xssProtection: {
      enable: false,
    },
    csp: {
      enable: false,
    },
    domainWhiteList: [
      'http://168.62.38.213',
      'http://drip.eastus.cloudapp.azure.com' ],
  }

  exports.cors = {
    credentials: true,
  }

  config.multipart = {
    fileSize: '10mb',
    whitelist: [
      '.sol',
    ],
  }

  config.chain = {
    nodeAddr: '23.101.129.174',
    gethPort: 8000,
    startBlock: 0,
    endBlock: 'latest',
    quiet: true,
    syncAll: true,
    patch: true,
    patchBlocks: 100,
    bulkSize: 100,
    defaultCoinbase: '0x03dc685491f13f0fc530fb038094bcce5c6da98f',
    defaultPwd: 'Mhb7wHGY3XGdKCzd',
    settings: {
      symbol: 'DRP',
      name: 'Drop',
      title: 'Ethereum Classic Block Explorer',
      author: 'Ryan',
    },
  }

  exports.logrotator = {
    filesRotateByHour: [], // list of files that will be rotated by hour
    hourDelimiter: '-', // rotate the file by hour use specified delimiter
    filesRotateBySize: [], // list of files that will be rotated by size
    maxFileSize: 50 * 1024 * 1024, // Max file size to judge if any file need rotate
    maxFiles: 10, // pieces rotate by size
    rotateDuration: 60000, // time interval to judge if any file need rotate
    maxDays: 31, // keep max days log files, default is `31`. Set `0` to keep all logs
  }

  exports.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [ 'connection' ],
        packetMiddleware: [ 'filter' ],
      },
    },
  }

  exports.mail = {
    sendgrid_server: 'http://drip.eastus.cloudapp.azure.com',
    sendgrid_username: 'azure_6d33a0d0b38403cb664ca8409ee51bef@azure.com',
    sendgrid_password: 'Pwcwelcomedrip1!',
    sendgrid_apikey: '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',
  }

  exports.azure_moderator = {
    url: 'https://eastus.api.cognitive.microsoft.com/contentmoderator/moderate/v1.0/ProcessText/Screen?classify=true',
    key: '2af09c01d54542d78465c23108f364d7',
    score: 0.25,
  }
  return config
}
