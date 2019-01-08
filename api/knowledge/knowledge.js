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
var async = require("async");
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
var insert = function (knowledgesReceived) {
    return new Promise((resolve, reject) => {
        let knowledges = []

        knowledgesReceived.forEach(knowledgeReceived => {
            let knowledge = new Knowledge(knowledgeReceived);

            knowledge.id = mongoose.Types.ObjectId();
            knowledge.topic = knowledge.topic.toLowerCase();

            knowledges.push(knowledge);
        });

        async.eachSeries(knowledges, function (knowledge, done) {
            Knowledge.findOne({ topic: knowledge.topic })
                .then((knowledgeDB) => {
                    if (!knowledgeDB) {
                        knowledge.save()
                            .then((knowledgeCreated) => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> KNOWLEDGE CREATED...: " + knowledgeCreated.topic);
                                console.log(" -----------------------------//--------------------------- ");
                                done();
                            }).catch(err => done(err));
                    } else {
                        done();
                    }
                }).catch(err => done(err));
        }, function (err) {
            if (!err) {
                listAll()
                    .then((knowledges) => {
                        resolve(knowledges)
                    }).catch(err => reject(err));
            } else {
                reject(err);
            }
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
            .then((knowledges) => {
                knowledges.forEach(function(knowledge) {
                    knowledge.topic = capitalize.words(knowledge.topic)
                });
                resolve(knowledges);
            }).catch(err => reject(err));
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
    schema: knowledgeSchema,
    insert: insert,
    listAll: listAll,
    deleteBy: deleteBy
};
