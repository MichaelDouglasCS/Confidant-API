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
var jwtSettings = require("../../config/jwt-settings");
var validator = require("validator");
var userValidation = require("./user.validation");
var async = require("async");
var knowledge = require("../knowledge/knowledge");
var media = require("../media/media");
var chat = require("../chat/chat");
var jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
var Schema = mongoose.Schema;

var userType = require("./userType.enum");

// ------ MODEL --------- //
var userSchema = Schema({
    id: String,
    email: String,
    password: String,
    createdDate: Number,
    token: String,
    profile: {
        name: String,
        nickname: String,
        picture: media.schema,
        birthdate: String,
        gender: String,
        typeOfUser: String,
        knowledges: [knowledge.schema],
        isAvailable: Boolean,
        chats: [chat.schema]
    }
});

// ------ MODEL --------- //
var confidantAvailabilitySchema = Schema({
    id: String,
    knowledge: String,
    availablesIDs: [String]
});

//Hide "_v", "password" and rename "_id" 
userSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

//Hide "_v", "password" and rename "_id" 
confidantAvailabilitySchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

var User = mongoose.model("User", userSchema);
var ConfidantAvailability = mongoose.model("ConfidantAvailability", confidantAvailabilitySchema);

// ----- PUBLIC METHODS ------- //
/**
 * Create a new user
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var create = function (userReceived) {
    return new Promise((resolve, reject) => {
        if (!userReceived.email || !validator.isEmail(userReceived.email)) {
            reject(userValidation.emailIsNotValid());
        } else {
            User.findOne({ email: userReceived.email })
                .then((userDB) => {
                    if (userDB) {
                        reject(userValidation.emailAlreadyInUse());
                    } else {
                        decrypt(userReceived.password)
                            .then((passDecrypted) => {
                                var user = new User(userReceived);
                                user.id = mongoose.Types.ObjectId();
                                user.password = passDecrypted;
                                user.createdDate = Date.now()
                                user.token = generateUserToken(user);
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> CREATING USER: " + user.profile.name);
                                console.log(" -----------------------------//--------------------------- ");
                                user.save()
                                    .then((userCreated) => {
                                        console.log(" -----------------------------//--------------------------- ");
                                        console.log(" --------> USER CREATED...");
                                        console.log(" -----------------------------//--------------------------- ");
                                        resolve(userCreated);
                                    }).catch(err => reject(err));
                            });
                    }
                }).catch(err => reject(err));
        }
    });
};

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

/**
 * Create or Authenticate an user by Facebook
 *
 * @author Michael Douglas
 * @since 03/08/2017
 *
 * History:
 * 03/08/2017 - Michael Douglas - Initial creation.
 *
 */
var facebook = function (userReceived) {
    return new Promise((resolve, reject) => {
        var parsedUser = new User(userReceived._json)
        parsedUser.profile.name = userReceived._json.name
        parsedUser.profile.birthdate = userReceived._json.birthday
        parsedUser.profile.gender = capitalize.words(userReceived._json.gender)

        console.log(" -----------------------------//--------------------------- ");
        console.log(" --------> PARSED USER: " + parsedUser);
        console.log(" -----------------------------//--------------------------- ");
        console.log(" --------> PARSED USER EMAIL: " + parsedUser.email);
        console.log(" -----------------------------//--------------------------- ");

        if (!parsedUser.email || parsedUser.email == "") {
            reject(userValidation.emailNotFound());
        } else {
            User.findOne({ email: parsedUser.email })
                .then((userDB) => {
                    console.log(" -----------------------------//--------------------------- ");
                    console.log(" --------> USER DB: " + userDB);
                    console.log(" -----------------------------//--------------------------- ");
                    if (!userDB) {
                        //Create
                        var user = new User(parsedUser);
                        user.createdDate = Date.now()
                        user.token = generateUserToken(user);
                        console.log(" -----------------------------//--------------------------- ");
                        console.log(" --------> CREATING USER: " + user.profile.name);
                        console.log(" -----------------------------//--------------------------- ");
                        console.log(" --------> CREATING USER EMAIL: " + user.email);
                        console.log(" -----------------------------//--------------------------- ");
                        user.save()
                            .then((userCreated) => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> USER CREATED...");
                                console.log(" -----------------------------//--------------------------- ");
                                resolve(userCreated);
                            }).catch(err => reject(err));
                    } else {
                        //Authenticate
                        userDB.token = generateUserToken(userDB);
                        console.log(" -----------------------------//--------------------------- ");
                        console.log(" --------> AUTHENTICATING USER: " + userDB.profile.name);
                        console.log(" -----------------------------//--------------------------- ");
                        userDB.save()
                            .then((userAuth) => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> USER AUTHENTICATED...");
                                console.log(" -----------------------------//--------------------------- ");
                                userAuth.password = undefined;
                                userAuth.profile = undefined;
                                resolve(userAuth);
                            }).catch(err => reject(err));
                    }
                }).catch(err => reject(err));
        }
    });
};

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
var update = function (userReceived) {
    return new Promise((resolve, reject) => {
        if (userReceived.profile.typeOfUser == userType.enum.CONFIDANT) {
            async.times(1, function (_, done) {
                refreshAvailability(userReceived)
                    .then(_ => done())
                    .catch(err => done(err));
            }, function (err) {
                if (!err) {
                    User.findOneAndUpdate({ email: userReceived.email }, userReceived, { upsert: true })
                        .then(_ => {
                            console.log(" -----------------------------//--------------------------- ");
                            console.log(" --------> USER UPDATED: " + userReceived.profile.name);
                            console.log(" -----------------------------//--------------------------- ");
                            resolve();
                        }).catch(err => reject(err));
                } else {
                    reject(err);
                }
            });
        } else {
            User.findOneAndUpdate({ email: userReceived.email }, userReceived, { upsert: true })
                .then(_ => {
                    console.log(" -----------------------------//--------------------------- ");
                    console.log(" --------> USER UPDATED: " + userReceived.profile.name);
                    console.log(" -----------------------------//--------------------------- ");
                    resolve();
                }).catch(err => reject(err));
        }
    });
};

// ----- PUBLIC METHODS ------- //
/**
 * Load an user
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var listByEmail = function (userEmail) {
    return new Promise((resolve, reject) => {
        User.findOne({ email: userEmail })
            .then((userDB) => {
                if (userDB) {
                    console.log(" -----------------------------//--------------------------- ");
                    console.log(" --------> USER LOADED: " + userDB.profile.name);
                    console.log(" -----------------------------//--------------------------- ");
                    resolve(userDB);
                } else {
                    reject(userValidation.internalError());
                }
            }).catch(err => reject(err));
    });
};

var listById = function (id) {
    return new Promise((resolve, reject) => {
        User.findOne({ id: id })
            .then((userDB) => {
                if (userDB) {
                    console.log(" -----------------------------//--------------------------- ");
                    console.log(" --------> USER LOADED: " + userDB.profile.name);
                    console.log(" -----------------------------//--------------------------- ");
                    resolve(userDB);
                } else {
                    reject(userValidation.internalError());
                }
            }).catch(err => reject(err));
    });
};

/**
 * Authenticate the user on DEV and BETA mode.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var authUserDevBeta = function (userReceived) {
    return new Promise((resolve, reject) => {
        User.findOne({ email: userReceived.email })
            .then((userDB) => {
                if (!userDB) {
                    reject(userValidation.userNotFound());
                } else {
                    if (userReceived.password == userDB.password) {
                        userDB.token = generateUserToken(userDB);
                        console.log(" -----------------------------//--------------------------- ");
                        console.log(" --------> Authenticating User: " + userDB.profile.name);
                        console.log(" -----------------------------//--------------------------- ");
                        userDB.save()
                            .then((userAuth) => {
                                console.log(" -----------------------------//--------------------------- ");
                                console.log(" --------> User Authenticated...");
                                console.log(" -----------------------------//--------------------------- ");
                                resolve(userAuth);
                            }).catch(err => reject(err));
                    } else {
                        reject(userValidation.userNotFound());
                    }
                }
            }).catch(err => {
                reject(userValidation.userNotFound());
            });
    });
}

/**
 * Generate the token to be used on the app transmissions.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var generateUserToken = function (userReceived) {
    userReceived.token = null;
    var token = jwt.sign(userReceived, jwtSettings.secretOrKey);
    return token;
}

/**
 * Decrypt string with private key.
 *
 * @author Michael Douglas
 * @since 01/08/2017
 *
 * History:
 * 01/08/2017 - Michael Douglas - Initial creation.
 *
 */
var decrypt = function (stringToDecrypt) {
    var CRYPT_KEY = "confidantappsecretkey";

    return new Promise((resolve, reject) => {
        var encryptedString = ""
        if (stringToDecrypt && stringToDecrypt != "") {
            encryptedString = stringToDecrypt
            var bytes = CryptoJS.AES.decrypt(encryptedString.toString(), CRYPT_KEY);
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        }
        // resolve(plaintext); //Change when the password beign sent encrypted
        resolve(encryptedString)
    });
}

//----------------------------------------------------CONFIDANT------------------------------------------------------------------//

// ----- PUBLIC METHODS ------- //
/**
 * Change Availability of User
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var changeAvailabilityById = function (confidantID) {
    return new Promise((resolve, reject) => {
        User.findOne({ id: confidantID })
            .then((confidant) => {
                if (confidant) {
                    if (!confidant.profile.isAvailable) {
                        insertAvailability(confidant)
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
                        removeAvailability(confidant)
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
 * Update Availability Collection
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var refreshAvailability = function (confidantReceived) {
    return new Promise((resolve, reject) => {
        User.findOne({ id: confidantReceived.id })
            .then((confidant) => {
                if (confidant) {

                    if (confidantReceived.profile.knowledges.lenght < confidant.profile.knowledges.lenght) {
                        confidant.profile.knowledges.forEach(knowledge => {
                            var index = confidantReceived.profile.knowledges.indexOf(confidant.id);
                            if (index != -1) {
                                confidant.profile.knowledges.splice(index, 1);
                            }
                        });
                    } else {
                        confidantReceived.profile.knowledges.forEach(knowledge => {
                            var index = confidant.profile.knowledges.indexOf(confidantReceived.id);
                            if (index != -1) {
                                confidant.profile.knowledges.splice(index, 1);
                            }
                        });
                    }

                    async.times(1, function (_, done) {
                        removeAvailability(confidant)
                            .then(_ => done())
                            .catch(err => done(err));
                    }, function (err) {
                        if (!err) {
                            if (confidantReceived.profile.isAvailable) {
                                insertAvailability(confidantReceived)
                                    .then(_ => resolve())
                                    .catch(err => reject(err));
                            } else {
                                removeAvailability(confidantReceived)
                                    .then(_ => resolve())
                                    .catch(err => reject(err));
                            }
                        } else {
                            reject(err);
                        }
                    });
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
var insertAvailability = function (confidant) {
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
                                console.log(" --------> AVAILABILITY CREATED...");
                                console.log(" -----------------------------//--------------------------- ");
                                done();
                            }).catch(err => done(err));
                    } else {
                        var index = confidantAvailability.availablesIDs.indexOf(confidant.id);

                        if (index == -1) {
                            confidantAvailability.availablesIDs.push(confidant.id);

                            ConfidantAvailability.findOneAndUpdate({ id: knowledge.id }, confidantAvailability, { upsert: true })
                                .then(_ => {
                                    console.log(" -----------------------------//--------------------------- ");
                                    console.log(" --------> AVAILABILITY UPDATED");
                                    console.log(" -----------------------------//--------------------------- ");
                                    done();
                                }).catch(err => done(err));
                        } else {
                            done();
                        }
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
var removeAvailability = function (confidant) {
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

                            ConfidantAvailability.findOneAndUpdate({ id: knowledge.id }, confidantAvailability, { upsert: true })
                                .then(_ => {
                                    console.log(" -----------------------------//--------------------------- ");
                                    console.log(" --------> AVAILABILITY UPDATED");
                                    console.log(" -----------------------------//--------------------------- ");
                                    done();
                                }).catch(err => done(err));
                        } else {
                            done();
                        }
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
 * Find Confidant by ID
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var matchConfidantByKnowledgeId = function (knowledgeID) {
    return new Promise((resolve, reject) => {

        ConfidantAvailability.findOne({ id: knowledgeID })
            .then((confidantAvailability) => {

                if (confidantAvailability) {
                    let availableIDs = confidantAvailability.availablesIDs
                    let confidantID = availableIDs[Math.floor(Math.random() * availableIDs.length)]
                    resolve(confidantID);                    
                } else {
                    reject();
                }
            }).catch(err => reject(err));
    });
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    model: User,
    create: create,
    authenticate: authenticate,
    facebook: facebook,
    update: update,
    listByEmail: listByEmail,
    listById: listById,
    changeAvailabilityById: changeAvailabilityById,
    matchConfidantByKnowledgeId: matchConfidantByKnowledgeId
};
