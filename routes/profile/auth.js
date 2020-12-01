const {User} = require('../../models/profile/user');
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const router = express.Router();
const _ = require('lodash');

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send('Email or password is incorrect !');

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).send('Email or password is incorrect !');

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send({
        'x-auth-token': token,
        user: _.pick(user, ['_id', 'name', 'email', 'wallet_address'])
    });
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(req);
}

module.exports = router;