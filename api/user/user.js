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
var jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
var Schema = mongoose.Schema;

var typeOfUserEnum = require("./userType.enum");

// ------ MODEL --------- //
var userSchema = mongoose.Schema({
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
userSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

var User = mongoose.model("User", userSchema);

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
        User.findOneAndUpdate({ email: userReceived.email }, userReceived, { upsert: true })
            .then(_ => {
                console.log(" -----------------------------//--------------------------- ");
                console.log(" --------> USER UPDATED: " + userReceived.profile.name);
                console.log(" -----------------------------//--------------------------- ");
                resolve()
            }).catch(err => reject(err));
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
var load = function (userEmail) {
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
                reject(serValidation.userNotFound());
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

// ----- MODULE EXPORTS -------- //
module.exports = {
    create: create,
    authenticate: authenticate,
    facebook: facebook,
    update: update,
    load: load
};
