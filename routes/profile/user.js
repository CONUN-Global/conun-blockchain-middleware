const {User, validate} = require('../../models/profile/user');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const web3Handlers = require('../../web3/eth.main');
const crypto = require('../../utils/crypto/encryption.algorithm');
const auth = require('../../middleware/auth');
const helper = require('../../app/helper')

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.get('/', auth, async (req, res) => {
    const user = await User.find();
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send({error: error.details[0].message, status: 400});
    if (req.body.isAdmin)
        return res.status(400).send({error: '-', status: 400});
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).send({error: 'User already exist', status: 400});
    try {
        let account = await web3Handlers.CreateAccountAdvanced(req.body.password);
        var wallet_address = account.wallet_address;
        var orgName = req.body.orgName;
        let response = await helper.getRegisteredUser(wallet_address, orgName, true);

        let encrypt = {
            privateKey: crypto.AesEncrypt(account.privateKey, req.body.password),
            stringKeystore: crypto.AesEncrypt(account.stringKeystore, req.body.password),
        }

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: req.body.orgName,
            password: req.body.password,
            isAdmin:  req.body.isAdmin,
            wallet_address: account.wallet_address,
            privateKey: encrypt.privateKey,
            stringKeystore: encrypt.stringKeystore
        });

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        await user.save()

        if (response && typeof response !== 'string') {
            res.send( _.pick(user, ['_id', 'name', 'email', 'wallet_address'])).status(201);
        } else {
            // logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
            res.json({ success: false, message: response }).status(400);
        }
    } catch (e) {
        res.json({ success: false, message: 'error while user creation' }).status(400);
    }
});

module.exports = router;