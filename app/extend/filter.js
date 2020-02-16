'use strict'

const etherUnits = require('./etherUnits.js')
const BigNumber = require('bignumber.js')
const RLP = require('rlp')

const filter = function() {
}

filter.hex2ascii = hexIn => {
  const hex = hexIn.toString()
  let str = ''

  try {
    const ba = RLP.decode(hex)
    const test = ba[ 1 ].toString('ascii')

    if (test === 'geth' || test === 'Parity') {
      // FIXME
      ba[ 0 ] = ba[ 0 ].toString('hex')
    }
    str = filter.baToString(ba)
  } catch (e) {
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }
  }
  return str
}

/* Filter an array of TX */
filter.filterTX = txs => {
  return txs.map(tx => {
    return [ tx.hash, tx.blockNumber, tx.from, tx.to, etherUnits.toEther(new BigNumber(tx.value), 'ether'), tx.gas, tx.timestamp ]
  })
}

filter.countTXeth = txs => {
  return txs.map(tx => {
    tx.ether = etherUnits.toEther(new BigNumber(tx.value), 'ether')
    return tx
  })
}

filter.filterTrace = txs => {
  return txs.map(tx => {
    const t = tx
    if (t.type === 'suicide') {
      if (t.action.address) {
        t.from = t.action.address
      }
      if (t.action.balance) {
        t.value = etherUnits.toEther(new BigNumber(t.action.balance), 'wei')
      }
      if (t.action.refundAddress) {
        t.to = t.action.refundAddress
      }
    } else {
      if (t.action.to) {
        t.to = t.action.to
      }
      t.from = t.action.from
      if (t.action.gas) {
        t.gas = new BigNumber(t.action.gas).toNumber()
      }
      if ((t.result) && (t.result.gasUsed)) {
        t.gasUsed = new BigNumber(t.result.gasUsed).toNumber()
      }
      if ((t.result) && (t.result.address)) {
        t.to = t.result.address
      }
      t.value = etherUnits.toEther(new BigNumber(t.action.value), 'wei')
    }
    return t
  })
}

filter.filterBlock = (block, field, value) => {
  let tx = block.transactions.filter(obj => {
    return obj[ field ] === value
  })
  tx = tx[ 0 ]
  if (typeof tx !== 'undefined') {
    tx.timestamp = block.timestamp
  }
  return tx
}

/* make blocks human readable */
filter.filterBlocks = blocks => {
  if (blocks.constructor !== Array) {
    const b = blocks
    const ascii = filter.hex2ascii(blocks.extraData)
    b.extraDataHex = blocks.extraData
    b.extraData = ascii
    return b
  }
  return blocks.map(block => {
    const b = block
    const ascii = filter.hex2ascii(block.extraData)
    b.extraDataHex = block.extraData
    b.extraData = ascii

    return b
  })
}

/* stupid datatable format */
filter.datatableTX = txs => {
  return txs.map(tx => {
    return [ tx.hash, tx.blockNumber, tx.from, tx.to,
      etherUnits.toEther(new BigNumber(tx.value), 'wei'), tx.gas, tx.timestamp ]
  })
}

filter.internalTX = txs => {
  return txs.map(tx => {
    return [ tx.transactionHash, tx.blockNumber, tx.action.from, tx.action.to,
      etherUnits.toEther(new BigNumber(tx.action.value), 'wei'), tx.action.gas, tx.timestamp ]
  })
}

/* modified baToJSON() routine from rlp */
filter.baToString = ba => {
  if (Buffer.isBuffer(ba)) {
    return ba.toString('ascii')
  } else if (ba instanceof Array) {
    const array = []
    for (let i = 0; i < ba.length; i++) {
      array.push(filter.baToString(ba[ i ]))
    }
    return array.join('/')
  }
  return ba
}

module.exports = filter
