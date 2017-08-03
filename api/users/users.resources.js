// users.resource.js

var express = require('express');
var passport = require('passport');
var router = express.Router();
var users = require('./users')
var responseUtils = require('../utils/response.utils');

/**
 * A route method to register the user.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.post('/register', (req, res) => {
    let user = req.body;
    users.register(user)
        .then((userAuth) => {
            let responseObj = responseUtils.buildBaseResponse();
            responseObj.user = userAuth;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

/**
 * A route method to Register or Authenticate the user by Facebook.
 *
 * @author Michael Douglas
 * @since 02/08/2017
 *
 * History:
 * 02/08/2017 - Michael Douglas - Initial creation.
 *
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback', (req, res) => {
    console.log("-------->REQ :" + req);
    console.log("-------->RES :" + res);
    passport.authenticate('facebook', (err, userFB, info) => {
        console.log("-------->ERR :" + err);
        console.log("-------->USERFB :" + userFB);
        console.log("-------->INFO :" + info);
        users.facebook(userFB)
            .then((userAuth) => {
                let responseObj = responseUtils.buildBaseResponse();
                responseObj.user = userAuth;
                res.status(200).json(responseObj);
            }).catch((error) => {
                let httpCode = error.status || 500;
                res.status(httpCode).json(responseUtils.buildBaseResponse(error));
            });
    })(req, res);
});

/**
 * A route method to authenticate the user.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.post('/authenticate', (req, res) => {
    let user = req.body;
    users.authenticate(user)
        .then((userAuth) => {
            let responseObj = responseUtils.buildBaseResponse();
            responseObj.user = userAuth;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

module.exports = router;
