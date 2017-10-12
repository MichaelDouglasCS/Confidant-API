// knowledge.resource.js

var express = require("express");
var router = express.Router();
var knowledge = require("./knowledge");
var responseUtils = require("../utils/response.utils");

/**
 * A route method to add a new Knowledge.
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
    knowledge.authenticate(userReceived)
        .then((userAuth) => {
            let responseObj = userAuth;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

module.exports = router;
