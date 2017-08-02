/*jshint esnext: true */

var express = require('express');
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
router.post('/register', (req, res, next) => {
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
 * A route method to authenticate the user.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.post('/authenticate', (req, res, next) => {
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
