/*jshint esnext: true */

/**
 * Model object to represent the Knowledge Schema
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var mongoose = require("mongoose");
var capitalize = require("capitalize");
var fs = require("fs");
var Schema = mongoose.Schema;

// ------ MODEL --------- //
var knowledgeSchema = Schema({
    id: String,
    topic: String
});

//Hide "_v", "password" and rename "_id" 
knowledgeSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

var Knowledge = mongoose.model("Knowledge", knowledgeSchema);

/**
 * List all Knowledges
 *
 * @author Michael Douglas
 * @since 27/07/2017
 *
 * History:
 * 27/07/2017 - Michael Douglas - Initial creation.
 *
 */
var insert = function (knowledgeReceived) {
    return new Promise((resolve, reject) => {
        let knowledge = new Knowledge(knowledgeReceived);
        knowledge.topic = knowledge.topic.toLowerCase();

        Knowledge.findOne({ topic: knowledge.topic })
            .then((knowledgeDB) => {
                if (!knowledgeDB) {
                    knowledge.id = mongoose.Types.ObjectId();
                    knowledge.save()
                        .then((knowledgeCreated) => {
                            knowledgeCreated.topic = capitalize.words(knowledgeCreated.topic)
                            console.log(" -----------------------------//--------------------------- ");
                            console.log(" --------> KNOWLEDGE CREATED...: " + knowledgeCreated.topic);
                            console.log(" -----------------------------//--------------------------- ");
                            resolve(knowledgeCreated);
                        }).catch(err => reject(err));
                } else {
                    knowledgeDB.topic = capitalize.words(knowledgeDB.topic)
                    resolve(knowledgeDB)
                }
            }).catch(err => {
                reject(err);
            });
    });
};

/**
 * List all Knowledges
 *
 * @author Michael Douglas
 * @since 27/07/2017
 *
 * History:
 * 27/07/2017 - Michael Douglas - Initial creation.
 *
 */
var listAll = function () {
    return new Promise((resolve, reject) => {
        Knowledge.find()
            .then((list) => {
                list.forEach(knowledge => {
                    knowledge.topic = capitalize.words(knowledge.topic)
                });
                resolve(list);
            }).catch(err => {
                reject(err);
            });
    });
};

/**
 * Delete Knowledges by ID
 *
 * @author Michael Douglas
 * @since 27/07/2017
 *
 * History:
 * 27/07/2017 - Michael Douglas - Initial creation.
 *
 */
var deleteBy = function (id) {
    return new Promise((resolve, reject) => {
        Knowledge.findOne({ id: id })
            .remove().exec(function (err, data) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
    });
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    insert: insert,
    listAll: listAll,
    deleteBy: deleteBy
};
