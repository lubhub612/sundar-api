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
        url: 'mongodb://104.211.1.23:27017/Drop',
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
      'http://localhost:3000',
      'http://104.211.1.23',
    ],
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
    nodeAddr: '104.211.1.23',
    gethPort: 8000,
    startBlock: 0,
    endBlock: 'latest',
    quiet: true,
    syncAll: true,
    patch: true,
    patchBlocks: 100,
    bulkSize: 100,
    defaultCoinbase: '0x427c1c68222df5118bf6116d3748749055164f1f',
    defaultPwd: 'password',
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
    sendgrid_server: 'http://104.211.1.23',
    sendgrid_username: 'azure_2de25147dbc9b5b6e8eb41131c36dfaf@azure.com',
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
