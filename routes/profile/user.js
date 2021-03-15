const {User, validate} = require('../../models/profile/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const helper = require('../../app/helper');
const auth = require('../../middleware/auth');
const owner = require('../../middleware/owner');
const web3Handlers = require('../../app/web3/eth.main');

const crypto = require('../../utils/crypto/encryption.algorithm');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({payload: user, success: true, status: 200})
    } catch (e) {
        res.status(400).json({payload: e.message, success: false, status: 400 })
    }
});

router.get('/checkKey', async (req, res) => {
    try {
        let user = await helper.getUserIdentity({
            orgName: req.query.orgName,
            walletAddress: req.user.walletAddress,
            walletType: req.query.walletType,
            password: req.query.password
        })
        console.log('>> user', user)
        res.status(200).json({payload: user, success: true, status: 200})
    } catch (e) {
        console.log('/checkKey: ', e)
        res.status(400).json({payload: e.message, success: false, status: 400 })
    }
});

router.post('/create', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({payload: 'User already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;

        const account = await web3Handlers.CreateAccountAdvanced(req.body.password);

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: account.walletAddress,
            isAdmin: false
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        let x509Identity = await helper.getRegisteredUser({
            walletAddress: account.walletAddress,
            orgName,
            walletType: req.body.walletType,
            privateKey: account.stringKeystore,
            password: req.body.password
        });
        console.log('response from register: ', x509Identity);
        if(x509Identity) await user.save();

        if (typeof wallet !== 'string') {
            // wallet = crypto.AesEncrypt(JSON.stringify(wallet), req.body.password)
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (e) {
        console.log('/create: ', e)
        res.status(400).json({payload: `${req.body.email} duplicate user error`, success: false, status: 400})
    }
});

router.post('/importEthPk', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({payload: 'User already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        const account = await web3Handlers.ImportAccountByPrivateKey(req.body.privateKey, req.body.password);

        user = new User({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: account.walletAddress,
            isAdmin: false
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        let x509Identity = await helper.getRegisteredUser({
            walletAddress: account.walletAddress,
            orgName,
            walletType: req.body.walletType,
            privateKey: account.stringKeystore,
            password: req.body.password
        });
        console.log('response from register: ', x509Identity);
        if(x509Identity) await user.save();

        if (typeof x509Identity !== 'string') {
            // walletKey = crypto.AesEncrypt(JSON.stringify(walletKey), req.body.password)
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (e) {
        console.log('/importEthPk: ', e)
        res.status(400).json({payload: `duplicate user or wallet error`, success: false, status: 400})
    }
})

router.post('/importWallet', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ email: req.body.email, walletAddress: req.body.walletAddress });
    if (!user)
        return res.status(400).json({payload: `User with this email: ${req.body.email} or wallet: ${req.body.walletAddress} account not exist`, success: false, status: 400});
    try {
        let orgName = req.body.orgName;

        let x509Identity = await helper.importUserByWallet({
            orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress,
            x509Identity: req.body.x509Identity,
        });
        console.log('response from register: ', x509Identity);

        if (typeof x509Identity !== 'string') {
            // walletKey = crypto.AesEncrypt(JSON.stringify(walletKey), req.body.password)
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (e) {
        console.log('/importWallet: ', e)
        res.status(400).json({payload: `duplicate user or wallet error`, success: false, status: 400})
    }
})

module.exports = router;
