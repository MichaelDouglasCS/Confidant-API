/*jshint esnext: true */

/**
 * Model object to represent the User Schema
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
var knowledge = require("../knowledge/knowledge");
var async = require("async");
var fs = require("fs");

var Schema = mongoose.Schema;
var user = require("./user");

// ------ MODEL --------- //
var confidantAvailabilitySchema = Schema({
    id: String,
    knowledge: String,
    availablesIDs: [String]
});

//Hide "_v", "password" and rename "_id" 
confidantAvailabilitySchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

var ConfidantAvailability = mongoose.model("ConfidantAvailability", confidantAvailabilitySchema);

// ----- PUBLIC METHODS ------- //
/**
 * Update a new user
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var changeAvailability = function (confidantID) {
    return new Promise((resolve, reject) => {
        user.model.findOne({ id: confidantID })
            .then((confidant) => {

                if (confidant) {

                    if (!confidant.profile.isAvailable) {
                        setOnline(confidant)
                            .then(_ => {
                                confidant.profile.isAvailable = true;
                                confidant.save()
                                    .then((confidantSaved) => {
                                        console.log(" -----------------------------//--------------------------- ");
                                        console.log(" --------> SET ONLINE: " + confidantSaved.profile.name);
                                        console.log(" -----------------------------//--------------------------- ");
                                        resolve(confidantSaved.profile.isAvailable);
                                    }).catch(err => reject(err));
                            }).catch(err => reject(err));
                    } else {
                        setOffline(confidant)
                            .then(_ => {
                                confidant.profile.isAvailable = false;
                                confidant.save()
                                    .then((confidantSaved) => {
                                        console.log(" -----------------------------//--------------------------- ");
                                        console.log(" --------> SET OFFLINE: " + confidantSaved.profile.name);
                                        console.log(" -----------------------------//--------------------------- ");
                                        resolve(confidantSaved.profile.isAvailable);
                                    }).catch(err => reject(err));
                            }).catch(err => reject(err));
                    }
                } else {
                    reject(userValidation.internalError());
                }
            }).catch(err => reject(err));
    });
};

// ----- PUBLIC METHODS ------- //
/**
 * Insert Confidant in the DB and Set Online
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var setOnline = function (confidant) {
    return new Promise((resolve, reject) => {
        let knowledges = confidant.profile.knowledges;

        async.eachSeries(knowledges, function (knowledge, done) {
            ConfidantAvailability.findOne({ id: knowledge.id })
                .then((confidantAvailability) => {

                    if (!confidantAvailability) {
                        let availability = ConfidantAvailability();
                        availability.id = knowledge.id;
                        availability.knowledge = knowledge.topic;
                        availability.availablesIDs.push(confidant.id);

                        availability.save()
                            .then((_) => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> GROUP CREATED...");
                                console.log(" -----------------------------//--------------------------- ");
                                done();
                            }).catch(err => done(err));
                    } else {
                        var index = confidantAvailability.availablesIDs.indexOf(confidant.id);

                        if (index == -1) {
                            confidantAvailability.availablesIDs.push(confidant.id);
                        }
                        
                        ConfidantAvailability.findOneAndUpdate({ id: knowledge.id }, confidantAvailability, { upsert: true })
                            .then(_ => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> GROUP UPDATED");
                                console.log(" -----------------------------//--------------------------- ");
                                done();
                            }).catch(err => done(err));
                    }
                }).catch(err => done(err));
        }, function (err) {
            if (!err) {
                resolve();
            } else {
                reject(err);
            }
        });
    });
};

// ----- PUBLIC METHODS ------- //
/**
 * Remove Confidant from the DB and Set Offline
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var setOffline = function (confidant) {
    return new Promise((resolve, reject) => {
        let knowledges = confidant.profile.knowledges;

        async.eachSeries(knowledges, function (knowledge, done) {
            ConfidantAvailability.findOne({ id: knowledge.id })
                .then((confidantAvailability) => {

                    if (!confidantAvailability) {
                        done();
                    } else {
                        var index = confidantAvailability.availablesIDs.indexOf(confidant.id);

                        if (index != -1) {
                            confidantAvailability.availablesIDs.splice(index, 1);
                        }

                        ConfidantAvailability.findOneAndUpdate({ id: knowledge.id }, confidantAvailability, { upsert: true })
                            .then(_ => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> GROUP UPDATED");
                                console.log(" -----------------------------//--------------------------- ");
                                done();
                            }).catch(err => done(err));
                    }
                }).catch(err => done(err));
        }, function (err) {
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
    changeAvailability: changeAvailability
};
