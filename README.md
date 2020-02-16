# drip-api

Service layer that serve drip's portal and wallet. 
Functionality includes:

1. Relay portal web3 request to chain
2. Serve off-chain metadata; such information include: block, transaction, smart contract, statistic, metrics

## Configuration

Config file -> config/config.default.js

Database
```js
config.mongoose = {
    clients: {
      blockDB: {
        url: 'mongodb://localhost/blockDB',
        options: {},
      },
    },
  }
``` 
Geth

```js
config.chain = {
    nodeAddr: '13.66.193.217',
    gethPort: 8000,
  }
```

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ **set $EGG_SERVER_ENV to env name ('dev', 'test'...)
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org


* This project is using web3@~0.19.0, which has a significant difference from the latest version. For reference - https://github.com/ethereum/wiki/wiki/JavaScript-API


## Api Doc


### 1. GET /blocks?start=&amount=&dsc=  ###

start (optional) string - Position of first item to be retrieved in db. (default: 0)
amount (optional) sring - Amount of items to be retrieved. (default: 100)
dsc (optional) booleen - Retrieve list by block number in reverse order. (default: false) 

Response:

```
{[
    {
        "_id": "5b99f70520313f4a1fff9754",
        "uncles": [],
        "extraData": "\u0000Ö\u0083\u0001\b\r\u0084geth\u0086go1.10\u0085linux",
        "gasLimit": 7992189,
        "gasUsed": 0,
        "miner": "0xb8db1b76b61f1086262ea2945c50be2b13adbb57",
        "number": 1,
        "timestamp": 1534309130,
        "txn": 0,
        "avgGasPrice": 0,
        "extraDataHex": "0xd68301080d846765746886676f312e3130856c696e7578"
    },
    {
        "_id": "5b99f70520313f4a1fff977a",
        "uncles": [],
        "extraData": "\u0000Ö\u0083\u0001\b\r\u0084geth\u0086go1.10\u0085linux",
        "gasLimit": 7984386,
        "gasUsed": 0,
        "miner": "0xb8db1b76b61f1086262ea2945c50be2b13adbb57",
        "number": 2,
        "timestamp": 1534309159,
        "txn": 0,
        "avgGasPrice": 0,
        "extraDataHex": "0xd68301080d846765746886676f312e3130856c696e7578"
    }
]}
```

### 2. GET /block/:number ###

number (mandatory) int - Block number of the queried block

Response:

```
{
    "_id": "5b98cd968bcee42a6d25b7a7",
    "difficulty": "131136",
    "extraData": "\u0000Ö\u0083\u0001\b\r\u0084geth\u0086go1.10\u0085linux",
    "gasLimit": 7976590,
    "gasUsed": 0,
    "hash": "0x267ad3ea00c75ca783de288d3c74a10f0b9e73c72e570964f9e34af4083ab369",
    "miner": "0xb8db1b76b61f1086262ea2945c50be2b13adbb57",
    "nonce": "0x6673532f412fcc36",
    "number": 3,
    "parentHash": "0xcda0932b0161812f0f51fddfc558b27f92f2876e7df35ad2f9cc3327cddd1792",
    "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "size": 534,
    "timestamp": 1534309162,
    "totalDifficulty": "394280",
    "transactions": []
}
```

### 3. GET /txs?start=&amount=&dsc=  ###

start (optional) string - Position of first item to be retrieved in db. (default: 0)
amount (optional) sring - Amount of items to be retrieved. (default: 100)
dsc (optional) booleen - Retrieve list by block number in reverse order. (default: false) 

Response:

```
[
    {
        "_id": "5b98cf6d8bcee42a6d26de9d",
        "blockHash": "0x7e71ab76ad388d344975f2e484c10da69e1a732a27e07d3f43c5b389a508703b",
        "blockNumber": 22223,
        "from": "0x5d5b679e2b77d87b201422ec8b133ffd7626c0c1",
        "gas": 2800000,
        "gasPrice": {
            "s": 1,
            "e": 11,
            "c": [
                100000000000
            ],
            "isBigNumber": true
        },
        "hash": "0x2760aead816768c2e4f474c046c657bd931e47b8004f13a1137072f2b4b39b9c",
        "input": "0xfdacd5760000000000000000000000000000000000000000000000000000000000000001",
        "nonce": 2,
        "to": "0x509e5f077cb90e602077d34bceacbf18ce2cf79f",
        "transactionIndex": 0,
        "value": {
            "s": 1,
            "e": 0,
            "c": [
                0
            ],
            "isBigNumber": true
        },
        "v": "0xc0a958e",
        "r": "0xe7f9faed681544a1cd91b498ac72643e643d897ef8fe1a9f5c8fe75627afcd03",
        "s": "0x3aac55efe4f3d82c9eee26fc5da918b0084dd05686b0cffe2469227ccb444309",
        "timestamp": 1534928026,
        "ethValue": "0",
        "inputVal": "\"\""
    },
    {
        "_id": "5b98cf6d8bcee42a6d26dea8",
        "blockHash": "0xa3bda79a713e4f3f83f9f193ae3b26826feb97ddb3327684c0b3dd0b8fa4b075",
        "blockNumber": 22221,
        "from": "0x5d5b679e2b77d87b201422ec8b133ffd7626c0c1",
        "gas": 2800000,
        "gasPrice": {
            "s": 1,
            "e": 11,
            "c": [
                100000000000
            ],
            "isBigNumber": true
        },
        "hash": "0x6fc89da782b20c93518bce396c96c24633bf2ca270d9d1bf7319930186c376e8",
        "input": "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102f8806100606000396000f300608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100aa5780638da5cb5b146100d5578063fdacd5761461012c575b600080fd5b34801561007357600080fd5b506100a8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610159565b005b3480156100b657600080fd5b506100bf610241565b6040518082815260200191505060405180910390f35b3480156100e157600080fd5b506100ea610247565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561013857600080fd5b506101576004803603810190808035906020019092919050505061026c565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561023d578190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b15801561022457600080fd5b505af1158015610238573d6000803e3d6000fd5b505050505b5050565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102c957806001819055505b505600a165627a7a72305820f783c29762e8b02a48b4736e7a5918bf5a85ab34b4ff5c78f427fe5f8d52e1400029",
        "nonce": 1,
        "to": null,
        "transactionIndex": 0,
        "value": {
            "s": 1,
            "e": 0,
            "c": [
                0
            ],
            "isBigNumber": true
        },
        "v": "0xc0a958e",
        "r": "0x9d6703f3fa78fd6c39e0589da9493b26c8b7e8d5eadc1257b8a122576ed2d57c",
        "s": "0x6a06e2678a75aae8b2090515624a1c90675bbbd2cb4a919155e6f664c39d7b78",
        "timestamp": 1534928011,
        "ethValue": "0",
        "inputVal": "\"\""
    }
]
```

### 4. GET /tx/:hash ###

hash (mandatory) string -  Hash of the queried transaction

Response:

```
{
    "_id": "5b98cf6d8bcee42a6d26de9d",
    "blockHash": "0x7e71ab76ad388d344975f2e484c10da69e1a732a27e07d3f43c5b389a508703b",
    "blockNumber": 22223,
    "from": "0x5d5b679e2b77d87b201422ec8b133ffd7626c0c1",
    "gas": 2800000,
    "hash": "0x2760aead816768c2e4f474c046c657bd931e47b8004f13a1137072f2b4b39b9c",
    "input": "0xfdacd5760000000000000000000000000000000000000000000000000000000000000001",
    "nonce": 2,
    "to": "0x509e5f077cb90e602077d34bceacbf18ce2cf79f",
    "transactionIndex": 0,
    "v": "0xc0a958e",
    "r": "0xe7f9faed681544a1cd91b498ac72643e643d897ef8fe1a9f5c8fe75627afcd03",
    "s": "0x3aac55efe4f3d82c9eee26fc5da918b0084dd05686b0cffe2469227ccb444309",
    "timestamp": 1534928026,
    "ethValue": "0",
    "inputVal": "\"\""
}
```

### 5. POST /account/register ###

Request Body:
```
{
    "name":"capriceli",
    "pwcMail":"caprice.s.li@pwc.com",
    "domain":"IMAT",
    "address":"0x00000000000000000000000000000000000"
}
```

Response:

```
{
    Status: 200 OK
}
```

### 6. POST /account/appRegister ###

Request Body:
```
{
    "name":"capriceli",
    "pwcMail":"caprice.s.li@pwc.com",
    "domain":"IMAT",
    "passphrase": ""
}
```

Response:

```
{
    success: true 
}
```

### 7. POST /account/login ###

Request Body:
```
{
    "pwcMail":"caprice.s.li@pwc.com",
    passphrase: ""
}
```

Response:

```
{
    status: 200 OK
}
```

### 8. POST /account/appLogin ###

Request Body:
```
{
    "pwcMail":"caprice.s.li@pwc.com",
    passphrase: ""
}
```

Response:

```
{
    keystore: "....",
    address: "0xab5657b96407a0a3fa1f6ed074e60608bd7630f2",
}
```

### 9. GET /accounts?status= ###

status (optional) string - One of 'created', 'active', 'inactive' (default: all)

Response:

```

[
    {
        "status":"created",
        "avatar":{"type":"Buffer",
        "data":<binary>,
        "_id":"5ba45aa377447554770be394",
        "address":"0x00000000000000004",
        "name":"capriceli",
        "pwcMail":"caprice.s.li@pwc.com",
        "domain":"IMAT"
    },
    {
        "status":"active",
        "avatar":<buffer>,
        "_id":"5ba45ab177447554770be395",
        "address":"0x00000000000000005",
        "name":"capriceli",
        "pwcMail":"caprice.s.li@pwc.com",
        "domain":"IMAT"
    },
    {
        "status":"active",
        "avatar":<binary>,
        "_id":"5ba45ab577447554770be396",
        "address":"0x00000000000000001",
        "name":"capriceli",
        "pwcMail":"caprice.s.li@pwc.com",
        "domain":"IMAT"
    },
    {
        "status":"inactive",
        "avatar":<binary>
        "_id":"5ba45ab977447554770be397",
        "address":"0x00000000000000002",
        "name":"capriceli",
        "pwcMail":"caprice.s.li@pwc.com",
        "domain":"IMAT"
    }
]


```


### 10. GET /account/:addr ###

addr (mandatory) string - Address of the requested user.

Response:

```

{
    "status": "inactive",
    "_id": "5ba4a69a029a7d8c4f0a2f8f",
    "address": "0x00000000000000005",
    "name": "capriceli",
    "pwcMail": "caprice.s.li@pwc.com",
    "domain": "IMAT",
    "avatar": <binary>
}

```


### 11. GET /account/activate/:token ###

token (mandatory) string - The activation token sent to user by email service.

Response:

```
{
    Status: 200 OK
}

```

```
{
    Status: 409 No matching doc found in db
}

```

```
{
    Status: 409 This account has already been activated.
}

```

```
{
    Status: 409 Activating a frozen account is not allowed.
}

```

### 12. GET /domains ###

Response:

```

[
    "IMAT",
    "ORACLE",
    "SAP",
    "SALESFORCE",
    "MICROSOFT",
    "CHINA&JAPAN",
    "GUIDEWIRE",
    "IFS",
    "ADT",
    "RC&MC"
]

```

### 13. GET /contractbyname/:name ###

name (mandatory) string - Fetch detail of one contract.

Response:

```

{
    "status": "Active",
    "params": [
        "0xbc26adc5a8b5fd04f641925692c7d4bc3e392737"
    ],
    "type": "other",
    "walletEnabled": false,
    "alias": "",
    "_id": "5be2638b83ded70fcb03d6e3",
    "creationTransaction": "0x1839db3a1984e47c4751d093421fba5ba76360eb9fbe43ef492ac5a450792377",
    "address": "0xfcc1f4c89c656c6308ce523461bc2e522262cec1",
    "contractName": "Favor.sol:FavorExchange",
    "compilerVersion": "0.4.25",
    "abi": "[{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"cancelFavor\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"bid\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"getBidders\",\"outputs\":[{\"name\":\"bidders\",\"type\":\"address[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_reward\",\"type\":\"uint256\"},{\"name\":\"_description\",\"type\":\"string\"},{\"name\":\"_name\",\"type\":\"string\"}],\"name\":\"postFavor\",\"outputs\":[{\"name\":\"thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"getFavor\",\"outputs\":[{\"name\":\"myId\",\"type\":\"uint256\"},{\"name\":\"status\",\"type\":\"string\"},{\"name\":\"reward\",\"type\":\"uint256\"},{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"description\",\"type\":\"string\"},{\"name\":\"postedByAddress\",\"type\":\"address\"},{\"name\":\"assignees\",\"type\":\"address[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"completeFavor\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"},{\"name\":\"_assigneeAddresses\",\"type\":\"address[]\"}],\"name\":\"addAssignee\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"revertCompleteFavor\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_favorId\",\"type\":\"uint256\"}],\"name\":\"acknowledgeFavor\",\"outputs\":[{\"name\":\"_thisFavorId\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"escrow\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"tokenContract\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"favorId\",\"type\":\"uint256\"}],\"name\":\"FavorEmitted\",\"type\":\"event\"}]",
    "byteCode": "....",
    "__v": 0
}

```

### 14. POST /account/delete/:address ###

address (mandatory) string - The address of the purging-to-be account.

Response:

```

{
    success: "true"
}

```


### 15. GET /store/posted/:address ###

address (mandatory) string - The address of account which posted items 

Response:

```
[
    {
        "_id": "5c08df98c8de3e7592af247a",
        "itemId": 0,
        "__v": 0,
        "availableUnit": 3,
        "counter": 1,
        "createdAt": "2018-12-06T08:36:39.689Z",
        "description": "DESCRIPTION TEST",
        "postedBy": "0x427c1c68222df5118bf6116d3748749055164f1f",
        "repeatable": true,
        "status": "Open",
        "title": "TITLE TEST",
        "unitPrice": 10,
        "updatedAt": "2018-12-06T08:45:57.175Z",
        "vendor": null,
        "redeems": [
            {
                "_id": "5c08e1c5c8de3e7592af2684",
                "index": 0,
                "itemId": 0,
                "redeemBy": "0xb5c5339d2cfe01a85bc0a5bc99b314d2316f10b9",
                "__v": 0,
                "createdAt": "2018-12-06T08:45:56.958Z",
                "status": "Redeem",
                "updatedAt": "2018-12-06T08:45:56.958Z",
                "purchaser": null,
                "item": null,
                "id": "5c08e1c5c8de3e7592af2684"
            }
        ],
        "id": "5c08df98c8de3e7592af247a"
    },
    {
        "_id": "5c134ae0c8de3e7592b5fcd4",
        "itemId": 1,
        "__v": 0,
        "availableUnit": 10,
        "counter": 0,
        "createdAt": "2018-12-14T06:17:04.895Z",
        "description": "Bread of milk flavor. Bought this morning.",
        "postedBy": "0x427c1c68222df5118bf6116d3748749055164f1f",
        "repeatable": true,
        "status": "Open",
        "title": "Milk bread",
        "unitPrice": 20,
        "updatedAt": "2018-12-14T06:19:30.661Z",
        "vendor": null,
        "redeems": [],
        "id": "5c134ae0c8de3e7592b5fcd4"
    }
]

```

### 16. GET /store/redeem/:address ###

address (mandatory) string - The address of account which redeem items 

Response:

```
[
    {
        "_id": "5c08e1c5c8de3e7592af2684",
        "index": 0,
        "itemId": 0,
        "redeemBy": "0xb5c5339d2cfe01a85bc0a5bc99b314d2316f10b9",
        "__v": 0,
        "createdAt": "2018-12-06T08:45:56.958Z",
        "status": "Redeem",
        "updatedAt": "2018-12-06T08:45:56.958Z",
        "purchaser": null,
        "item": {
            "_id": "5c08df98c8de3e7592af247a",
            "itemId": 0,
            "__v": 0,
            "availableUnit": 3,
            "counter": 1,
            "createdAt": "2018-12-06T08:36:39.689Z",
            "description": "DESCRIPTION TEST",
            "postedBy": "0x427c1c68222df5118bf6116d3748749055164f1f",
            "repeatable": true,
            "status": "Open",
            "title": "TITLE TEST",
            "unitPrice": 10,
            "updatedAt": "2018-12-06T08:45:57.175Z",
            "vendor": null,
            "redeems": null,
            "id": "5c08df98c8de3e7592af247a"
        },
        "id": "5c08e1c5c8de3e7592af2684"
    }
]

```
### 17. GET /store/items/:status ###
status (mandatory) string - the items status, could be "Open", "Pending", "Void", "SoldOut"

Response:

```

[
    {
        "_id": "5c08df98c8de3e7592af247a",
        "itemId": 0,
        "__v": 0,
        "availableUnit": 3,
        "counter": 1,
        "createdAt": "2018-12-06T08:36:39.689Z",
        "description": "DESCRIPTION TEST",
        "postedBy": "0x427c1c68222df5118bf6116d3748749055164f1f",
        "repeatable": true,
        "status": "Open",
        "title": "TITLE TEST",
        "unitPrice": 10,
        "updatedAt": "2018-12-06T08:45:57.175Z",
        "vendor": null,
        "redeems": null,
        "id": "5c08df98c8de3e7592af247a"
    },
    {
        "_id": "5c134ae0c8de3e7592b5fcd4",
        "itemId": 1,
        "__v": 0,
        "availableUnit": 10,
        "counter": 0,
        "createdAt": "2018-12-14T06:17:04.895Z",
        "description": "Bread of milk flavor. Bought this morning.",
        "postedBy": "0x427c1c68222df5118bf6116d3748749055164f1f",
        "repeatable": true,
        "status": "Open",
        "title": "Milk bread",
        "unitPrice": 20,
        "updatedAt": "2018-12-14T06:19:30.661Z",
        "vendor": null,
        "redeems": null,
        "id": "5c134ae0c8de3e7592b5fcd4"
    }
]

```