const Web3 = require('web3');
const config = require('config');
const CallInvokeSwap = require('./helper/swap.conx');
const {Swap} = require('../models/profile/swap.model');
const {User} = require('../models/profile/user');
require('../startup/db')();

class EtherEvent {
    constructor(contractAddress, abi, url) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.url = url;
        this.provider = new Web3.providers.WebsocketProvider(this.url);
        this.web3 = new Web3(this.provider);
        this.listenContract = new this.web3.eth.Contract(this.abi, this.contractAddress);
    }


    querySwapID(queryData) {
        return new Promise (
            (resolve, reject) => {
                queryData.returnValues = JSON.parse(JSON.stringify(queryData.returnValues).replace('Result', ''));
                User.findOne({walletAddress: queryData.returnValues.from.toLowerCase()})
                    .then((user) => {
                        Swap.findOne({wallet: user._id , swapID: queryData.returnValues.swapID})
                            .then((swap) => {
                                    Swap.findByIdAndUpdate(swap._id,
                                        {
                                            ethereumTx: queryData.transactionHash,
                                            isComplited: false,
                                        },
                                        {new: true}
                                    )
                                    .then((ethereumTx) => {
                                        resolve({
                                            queryData,
                                            user,
                                            swap,
                                            ethereumTx
                                        }); 
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    }) 
                    .catch((err) => {
                        reject(err)
                    })
        })
    }

    swapCONtoCONX(ivoke) {
        console.log('>> swapCONtoCONX: ', ivoke)
        return new Promise(
            (resolve, reject) => {
                CallInvokeSwap('CheckIdExists', {
                    channelName: 'mychannel',
                    chainCodeName: 'bridge',
                    fcn: 'CheckIdExists',
                    orgName: ivoke.user.orgName,
                    swapID: ivoke.swap.swapID.slice(2, ivoke.swap.swapID.length),
                    walletAddress: ivoke.user.walletAddress,
                }).then((res) => {
                    console.log('CheckIdExists: ', res)
                    CallInvokeSwap('MintAndTransfer', {
                        channelName: 'mychannel',
                        chainCodeName: 'bridge',
                        fcn: 'MintAndTransfer',
                        orgName: ivoke.user.orgName,
                        id: ivoke.swap.swapID.slice(2, ivoke.swap.swapID.length),
                        key: ivoke.swap.swapKey.slice(2, ivoke.swap.swapKey.length),
                        walletAddress: ivoke.user.walletAddress,
                        amount: ivoke.swap.amount,
                        messageHash: ivoke.swap.messageHash,
                        signature: ivoke.swap.signature
                    })
                    .then((response) => {
                        const filter = {
                            wallet: ivoke.user._id,
                            swapID: ivoke.queryData.returnValues.swapID,
                            amount: response.Value
                        }
                        const update = {
                            amount: response.Value,
                            conunTx: response.txHash,
                            isComplited: true,
                            complitedAt: Date.now()
                        }
                        Swap.findOneAndUpdate(filter, update, {new: true})
                            .then((conunTX) => {
                                console.log('ethereumTx', ivoke.ethereumTx.ethereumTx)
                                console.log('conunTX', response.txHash);
                                resolve(conunTX);    
                            })
                            .catch((err) => {
                                reject(err)
                            })
                        
                    })
                    .catch((error) => {
                        reject(error);
                });
                })       
            }
        );
    }

    swapCONXtoCON(ivoke) {
        console.log('>> swapCONXtoCON', ivoke)
        return new Promise(
            (resolve, reject) => {
                CallInvokeSwap('BurnFrom', {
                        channelName: 'mychannel',
                        chainCodeName: 'bridge',
                        fcn: 'BurnFrom',
                        orgName: ivoke.user.orgName,
                        id: ivoke.swap.swapID.slice(2, ivoke.swap.swapID.length),
                        walletAddress: ivoke.user.walletAddress,
                        amount: ivoke.swap.amount,
                        messageHash: ivoke.swap.messageHash,
                        signature: ivoke.swap.signature
                    })
                    .then((response) => {
                        const filter = {
                            wallet: ivoke.user._id,
                            swapID: ivoke.queryData.returnValues.swapID,
                            amount: response.Value
                        }
                        const update = {
                            amount: response.Value,
                            conunTx: response.txHash,
                            isComplited: true,
                            complitedAt: Date.now()
                        }
                        Swap.findOneAndUpdate(filter, update, {new: true})
                            .then((conunTX) => {
                                console.log('ethereumTx', ivoke.ethereumTx.ethereumTx)
                                console.log('conunTX', response.txHash);
                                resolve(conunTX);
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    })
                    .catch((error) => {
                        reject(error);
                });       
            }
        );
    }

    listenEvent() {
        this.listenContract.events.allEvents()
        .on('connected', (id) => {
            console.log('Ethereum EVENT CONNECTED', id);
        })
        .on('data', (data) => {
            if(data.event === 'CONtoCONX')
                this.querySwapID(data)
                    .then((invoke) => {
                        this.swapCONtoCONX(invoke)
                    })
                    .catch((error) => {
                        console.log('error: ', error)
                    })
            else if(data.event === 'CONXtoCON')
                    this.querySwapID(data)
                        .then((invoke) => {
                            this.swapCONXtoCON(invoke)
                        })
                        .catch((error) => {
                            console.log('CONXtoCON error: ', error)
                        })        
        })
        .on('error', (err) => {
            console.log('listenContractEvent err: ', err);
        });
    }
}


let BridgeContractAddress = config.get('ethereum.bridge_contract_address');
let bridgeAbiJson = require('../app/web3/bridge.swap.abi.json');
let url = config.get('ethereum.wsProvider');

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();