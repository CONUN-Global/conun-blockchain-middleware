const { Gateway } = require('fabric-network');
const connectionOrg = require('./helper/conection')
const config = require('config');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const web3 = new Web3(provider);

const Helper = require('../common/helper');
const logger = Helper.helper.getLogger('app');

module.exports = {
    BalanceOf: async (arg) => {
        try {
            // console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.queryConnectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);

            // Get the contract from the network.
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.evaluateTransaction(arg.fcn, arg.walletAddress);
            // console.log(`Transaction has been evaluated, result is: ${result}`);
            return web3.utils.fromWei(result.toString(), "ether");
        } catch (error) {
            logger.error(`BalanceOf: Failed to evaluate transaction: ${error}`, arg);
            return false
        }
    },

    GetDetails: async (arg) => {
        try {
            // console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.queryConnectOptions);
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let result = await contract.evaluateTransaction(arg.fcn);
            // console.log(`Transaction has been evaluated, result is: ${result}`);
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`GetDetails: Failed to evaluate transaction: ${error}`, arg);
            return false
        }
    },

    ClientAccountID: async (arg) => {
        try {
            // console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.queryConnectOptions);
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let result = await contract.evaluateTransaction(arg.fcn);
            // console.log(`Transaction has been evaluated, result is: ${result}`);
            return result.toString();
        } catch (error) {
            logger.error(`ClientAccountID: Failed to evaluate transaction: ${error}`, arg);
            return false
        }
    },

    _getTransactionByID: async (arg) => {
        try {
            // console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.queryConnectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            // const channel = connection.getChannel(arg.channelName);

            // Get the contract from the network.
            // const contract = network.getContract(arg.chainCodeName);

            // let result = await contract.evaluateTransaction(arg.fcn, arg.wallet_address);
            //todo ' peer chaincode invoke \
            //         -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
            //         $PEER_CONN_PARMS \
            //         -C mychannel -n qscc \
            //         -c '{"function":"GetTransactionByID","Args":["mychannel", "b2d4920bb653cced5622e7a51dc90f3c23df83172eaee670605e4be1d1b1f6e5"]}'
            let result = await network.queryTransaction('b2d4920bb653cced5622e7a51dc90f3c23df83172eaee670605e4be1d1b1f6e5', 'peer0.org1.example.com')

            // console.log(`Transaction has been evaluated, result is: ${result}`);
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`_getTransactionByID: Failed to evaluate transaction: ${error}`, arg);
            return false
        }
    }
}
