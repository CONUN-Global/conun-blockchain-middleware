const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const helper = require('./helper');


async function connectionOrg(wallet_address, org_name) {
    try {
        console.log('connectionOrg: ', wallet_address, org_name);
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`connectionOrg Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(wallet_address);
        if (!identity) {
            console.log(`An identity for the user ${wallet_address} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(wallet_address, org_name, true)
            identity = await wallet.get(wallet_address);
            console.log('Run the registerUser.js application before retrying', identity);
            return;
        }

        const connectOptions = {
            wallet, identity: wallet_address, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            },
        }
        return  {
            ccp,
            connectOptions
        };
    } catch (e) {
        console.log('connectionOrg Error: ', e);
    }
}

module.exports = {
    Transfer: async (arg) => {
        try {
            console.log('>> Transfer: ', arg);
            const connection = await connectionOrg(arg._from, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg._from, arg.to, arg.value);

            await gateway.disconnect();

            result = result.toString();

            return result;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return error.message
        }
    },

    Burn: async (arg) => {
        try {
            console.log('>> Burn: ', arg);
            const connection = await connectionOrg(arg.admin_wallet, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.admin_wallet, arg.amount);

            await gateway.disconnect();

            result = result.toString();

            return result;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return error.message
        }
    },

    SetOption: async (arg) => {
        try {
            console.log('>> SetOption: ', arg);
            const connection = await connectionOrg(arg.wallet_address, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.name, arg.symbol, arg.decimals);

            await gateway.disconnect();

            result = result.toString();

            return result;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return error.message
        }
    },

    Mint: async (arg) => {
        try {
            console.log('>> Mint: ', arg);
            const connection = await connectionOrg(arg.wallet_address, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.wallet_address, arg.amount);

            await gateway.disconnect();

            result = result.toString();

            return result;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return error.message
        }
    }
}


