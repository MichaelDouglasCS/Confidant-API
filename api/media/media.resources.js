// user.resource.js

var express = require("express");
var router = express.Router();
var media = require("./media");
var multer = require("multer");
var upload = multer({ dest: __dirname + "/temp" });
var responseUtils = require("../utils/response.utils");

/**
 * A route method to upload User Profile Picture.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.post("/", upload.single("file"), (req, res) => {

    //Upload File
    media.upload(req.file)
        .then((media) => {
            let responseObj = media;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

module.exports = router;
