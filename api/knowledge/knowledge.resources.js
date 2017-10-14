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
    let knowledgeReceived = req.body;
    knowledge.insert(knowledgeReceived)
        .then((knowledge) => {
            let responseObj = knowledge;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

/**
 * A route method to get All Knowledges.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.get("/", (req, res) => {
    knowledge.listAll()
        .then((list) => {
            let responseObj = list;
            res.status(200).json(responseObj);
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

/**
 * A route method to Delete Knowledge by ID.
 *
 * @author Michael Douglas
 * @since 26/07/2017
 *
 * History:
 * 26/07/2017 - Michael Douglas - Initial creation.
 *
 */
router.delete("/:id", (req, res) => {
    let id = req.params.id;
    knowledge.deleteBy(id)
        .then(() => {
            res.status(200).json();
        }).catch((error) => {
            let httpCode = error.status || 500;
            res.status(httpCode).json(responseUtils.buildBaseResponse(error));
        });
});

module.exports = router;
