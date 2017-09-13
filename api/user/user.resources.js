// user.resource.js

var express = require("express");
var queryString = require('query-string');
var passport = require("passport");
var router = express.Router();
var user = require("./user")
let userValidation = require("./user.validation");
var responseUtils = require("../utils/response.utils");

/**
 * A route method to create the user.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.post("/", (req, res) => {
    let userReceived = req.body;
    user.create(userReceived)
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
router.post("/authenticate", (req, res) => {
    let userReceived = req.body;
    user.authenticate(userReceived)
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
 * A route method to Create or Authenticate the user by Facebook.
 *
 * @author Michael Douglas
 * @since 02/08/2017
 *
 * History:
 * 02/08/2017 - Michael Douglas - Initial creation.
 *
 */
// ---------> "user_birthday" Send to Facebook allow permissions
router.get("/facebook", passport.authenticate("facebook", { scope: ["public_profile", "email", "user_birthday"] }));
router.get("/facebook/callback", (req, res) => {
    passport.authenticate("facebook", (err, userFB, info) => {
        if (err || !userFB) {
            res.status(userValidation.facebookError().status).redirect("confidant://facebookUser/error/");
        } else {
            user.facebook(userFB)
                .then((userAuth) => {
                    let responseObj = responseUtils.buildBaseResponse();
                    responseObj.user = userAuth;
                    var userParams = JSON.stringify(userAuth);
                    res.status(200).redirect("confidant://facebookUser/user/" + userParams);
                }).catch((error) => {
                    let httpCode = error.status || 500;
                    res.status(httpCode).redirect("confidant://facebookUser/error/");
                });
        }
    })(req, res);
});

module.exports = router;
