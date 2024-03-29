/**
 * check if wallet owner send request
 * verifying wallet
 * return: boolean
 */
function owner(req, res, next) {
    try {
        let walletAddress = req.query.walletAddress || req.body.walletAddress || req.body.fromAddress;
        if(walletAddress !== req.user.walletAddress)
            return res.status(400).json({payload: 'requester is not owner', success: false,  status:  400 })
        next();
    } catch (e) {
        return res.status(400).json({payload: e.message, success: false,  status:  400 })
    }
}

module.exports = owner;
