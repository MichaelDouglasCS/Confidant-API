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
var fs = require("fs");
var Schema = mongoose.Schema;

// ------ MODEL --------- //
var knowledgeSchema = mongoose.Schema({
    id: String,
    email: String,
    password: String,
    createdDate: Number,
    token: String,
    profile: {
        name: String,
        nickname: String,
        picture: { fileURL: String },
        birthdate: String,
        gender: String,
        typeOfUser: String
    }
});

//Hide "_v", "password" and rename "_id" 
knowledgeSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

var Knowledge = mongoose.model("Knowledge", knowledgeSchema);

/**
 * Authenticate the user
 *
 * @author Michael Douglas
 * @since 27/07/2017
 *
 * History:
 * 27/07/2017 - Michael Douglas - Initial creation.
 *
 */
var authenticate = function (userReceived) {
    return new Promise((resolve, reject) => {
        decrypt(userReceived.password)
            .then((passDecrypted) => {
                userReceived.password = passDecrypted;
                if (!userReceived.email || userReceived.email == "" ||
                    !userReceived.password || userReceived.password == "") {
                    reject(userValidation.userNotFound());
                } else {
                    authUserDevBeta(userReceived)
                        .then((userAuth) => {
                            userAuth.password = undefined;
                            resolve(userAuth);
                        }).catch(err => reject(err));
                }
            });

    });
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    authenticate: authenticate
};
