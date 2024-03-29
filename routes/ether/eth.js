const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const owner = require('../../middleware/owner');
const x509 = require('../../middleware/x509');
const Eth = require('../../app/web3/eth.main');
const helper = require('../../app/helper/token.helper');

const Helper = require("../../common/helper");
const logger = Helper.getLogger("ether/eth");

router.post('/SendETH', async (req, res) => {
    helper.getUserIdentity({
        orgName: req.body.orgName,
        walletAddress: req.body.fromAddress,
        walletType: req.body.walletType,
        password: req.body.password
    }).then((ledgerData) => {
        Eth.keyStoreDecrypt(ledgerData.keyStore, req.body.password).then((result) => {
            Eth.SendETH({
                fromAddress: req.body.fromAddress,
                toAddress: req.body.toAddress,
                value: req.body.value,
                gasLimit: req.body.gasLimit,
                gasPrice: req.body.gasPrice,
                privateKey: result.privateKey
            }).then((txHash) => {
                    res.status(200).json({
                        payload: txHash,
                        success: true,
                        status: 200
                    });
                }).catch((error) => {
                    logger.error(`SendETH: Reqeest: ${JSON.stringify(req.body)} `, error);
                    res.status(400).json({
                        payload: error,
                        success: false,
                        status: 400
                    });
            })
        })
    })
});

router.post('/SendCON', async (req, res) => {
    helper.getUserIdentity({
        orgName: req.body.orgName,
        walletAddress: req.body.fromAddress,
        walletType: req.body.walletType,
        password: req.body.password
    }).then((ledgerData) => {
        Eth.keyStoreDecrypt(ledgerData.keyStore, req.body.password).then((result) => {
            Eth.SendCON({
                fromAddress: req.body.fromAddress,
                toAddress: req.body.toAddress,
                value: req.body.value,
                gasLimit: req.body.gasLimit,
                gasPrice: req.body.gasPrice,
                privateKey: result.privateKey
            }).then((txHash) => {
                res.status(200).json({
                    payload: txHash,
                    success: true,
                    status: 200
                });
            }).catch((error) => {
                logger.error(`SendCON: Reqeest: ${JSON.stringify(req.body)} `, error);
                res.status(400).json({
                    payload: error,
                    success: false,
                    status: 400
                });
            })
        })
    })
});


router.get('/getBalanceOfEth', async (req, res) => {
    Eth.getBalanceOfEth(req.query.walletAddress)
        .then((balance) => {
          res.status(200).json({
              payload: balance,
              success: true,
              status: 200
          });
      }).catch((error) => {
          logger.error(`getBalanceOfEth: Reqeest: ${JSON.stringify(req.body)} `, error);
          res.status(400).json({
              payload: error,
              success: false,
              status: 400
          });
    })
});


router.get('/getBalanceOfCon', async (req, res) => {
    Eth.getBalanceOfCon(req.query.walletAddress)
        .then((balance) => {
            res.status(200).json({
                payload: balance,
                success: true,
                status: 200
            });
        }).catch((error) => {
            logger.error(`getBalanceOfEth: Reqeest: ${JSON.stringify(req.body)} `, error);
            res.status(400).json({
                payload: error,
                success: false,
                status: 400
            });
    })
});

router.get('/getTransactionFeeETH', async (req, res) => {
    Eth.getTransactionFee({
        fromAddress: req.query.fromAddress,
        toAddress: req.query.toAddress
    })
        .then((fee) => {
            res.status(200).json({
                payload: fee,
                success: true,
                status: 200
            });
        }).catch((error) => {
            logger.error(`getTransactionFeeETH: Reqeest: ${JSON.stringify(req.body)} `, error);
            res.status(400).json({
                payload: error,
                success: false,
                status: 400
            });
    })
});

router.get('/getTransactionFeeCON', async (req, res) => {
    Eth.TokenEstimateGasFee({
        fromAddress: req.query.fromAddress,
        toAddress: req.query.toAddress,
        value: req.query.value
    })
        .then((fee) => {
            res.status(200).json({
                payload: fee,
                success: true,
                status: 200
            });
        }).catch((error) => {
            logger.error(`getTransactionFeeCON: Reqeest: ${JSON.stringify(req.body)} `, error);
            res.status(400).json({
                payload: error,
                success: false,
                status: 400
            });
    })
});

module.exports = router;
