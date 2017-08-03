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
let mongoose = require("mongoose");
let ObjectId = require('mongoose').Types.ObjectId;
var passport = require('passport');
let jwtSettings = require('../../config/jwt-settings');
let validator = require('validator');
let userValidation = require('./users.validation');
let jwt = require('jsonwebtoken');
let CryptoJS = require('crypto-js');
let Schema = mongoose.Schema;

let typeOfUserEnum = require('./userType.enum');

// ------ MODEL --------- //
let userSchema = mongoose.Schema({
    id: String,
    email: String,
    password: String,
    name: String,
    birthdate: String,
    age: String,
    gender: String,
    typeOfUser: String,
    createdDate: Number,
    deviceToken: String
});

//Hide "_v", "password" and rename "_id" 
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

let User = mongoose.model('User', userSchema);

// ----- PUBLIC METHODS ------- //
/**
 * Register a new user
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let register = function (userReceived) {
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
                                let user = new User(userReceived);
                                user.password = passDecrypted;
                                user.createdDate = Date.now()
                                user.deviceToken = generateUserToken(user);
                                console.log("Registering User: " + user.name);
                                user.save()
                                    .then((userRegistered) => {
                                        console.log("User Registered...");
                                        resolve(userRegistered);
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
let authenticate = function (userReceived) {
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
                            delete userAuth.password;
                            resolve(userAuth);
                        }).catch(err => reject(err));
                }
            });

    });
};

/**
 * Register or Authenticate an user by Facebook
 *
 * @author Michael Douglas
 * @since 03/08/2017
 *
 * History:
 * 03/08/2017 - Michael Douglas - Initial creation.
 *
 */
let facebook = function (userReceived) {
    return new Promise((resolve, reject) => {
        let parsedUser = new User(userReceived._json)
        parsedUser.age = userReceived._json.age_range.min
        console.log("-------->PARSED USER :" + parsedUser);
        console.log("-------->PARSED USER EMAIL :" + parsedUser.email);

        User.findOne({ email: parsedUser.email })
            .then((userDB) => {
                console.log("-------->USER DB :" + userDB);
                if (!userDB) {
                    //Register
                    let user = new User(parsedUser);
                    user.createdDate = Date.now()
                    user.deviceToken = generateUserToken(user);
                    console.log("Registering User: " + user.name);
                    user.save()
                        .then((userRegistered) => {
                            console.log("User Registered...");
                            resolve(userRegistered);
                        }).catch(err => reject(err));
                } else {
                    //Authenticate
                    userDB.deviceToken = generateUserToken(userDB);
                    console.log("Authenticating User: " + userDB.name);
                    userDB.save()
                        .then((userAuth) => {
                            console.log("User Authenticated...");
                            resolve(userAuth);
                        }).catch(err => reject(err));
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
let authUserDevBeta = function (userReceived) {
    return new Promise((resolve, reject) => {
        User.findOne({ email: userReceived.email })
            .then((userDB) => {
                if (!userDB) {
                    reject(userValidation.userNotFound());
                } else {
                    if (userReceived.password == userDB.password) {
                        userDB.deviceToken = generateUserToken(userDB);
                        console.log("Authenticating User: " + userDB.name);
                        userDB.save()
                            .then((userAuth) => {
                                console.log("User Authenticated...");
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
let generateUserToken = function (userReceived) {
    userReceived.deviceToken = null;
    let token = jwt.sign(userReceived, jwtSettings.secretOrKey);
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
let decrypt = function (stringToDecrypt) {
    let CRYPT_KEY = 'confidantappsecretkey';

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
    register: register,
    authenticate: authenticate,
    facebook: facebook
};
