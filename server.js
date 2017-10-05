var express = require("express");
var expressJWT = require("express-jwt");
var jwt = require("jsonwebtoken");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var compression = require("compression");

var responseUtils = require("./api/utils/response.utils");
var jwtSettings = require("./config/jwt-settings");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var databaseConfig = require("./config/database");
var configAuth = require("./config/auth");

var user = require("./api/user/user.resources");
var media = require("./api/media/media.resources");

var app = express();

//BaseURL
var baseURL = "/confidant/api/v1";

// To compress the responses:
app.use(compression());

//MONGOOSE INIT
var mongoOptions = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 300000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 300000 } }
};
var mongoURL = (process.env.MONGODB_URL || databaseConfig.developmentLocal.mongoURL) + "?socketTimeoutMS=120000";
mongoose.Promise = global.Promise;
mongoose.connect(mongoURL, mongoOptions);
var db = mongoose.connection;
db.on("error", function (callback) {
    console.error("Error connecting into MongoDB: " + callback);
});

//Open MongoDB Connection
db.once("open", function () {
    console.log("MongoDB - Connection successfully");
});

// Config
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Config Passport
app.use(passport.initialize());
passport.use(new FacebookStrategy(configAuth.facebookAuth, configAuth.facebookCallback));

//Middleware
// app.use(
//     expressJWT({ secret: jwtSettings.secretOrKey }).unless({
//         path: [baseURL + "/user",
//         baseURL + "/user/authenticate",
//         baseURL + "/user/facebook",
//         baseURL + "/user/facebook/callback"]
//     })
// );

//Middleware for User
app.use(function (req, res, next) {

    //check if it's user endpoint
    let isUsersEndpoint = req.url.indexOf("/user") !== -1;
    if (isUsersEndpoint) {
        let isUser = req.url.indexOf("/user") !== -1;
        let isAuthenticate = req.url.indexOf("/user/authenticate") !== -1;
        let isFacebook = req.url.indexOf("/user/facebook") !== -1;
        let isFacebookCallback = req.url.indexOf("/user/facebook/callback") !== -1;

        if (isAuthenticate || isFacebook || isFacebookCallback) {
            return next();
        } else if (isUser) {

            if (req.method == "POST") {
                return next();
            }
        }
    }

    // check header for token
    var token = req.headers["authorization"];

    if (token && token != "" && token.split(' ')[0] === "Bearer") {
        jwt.verify(token.split(' ')[1], jwtSettings.secretOrKey, function (err, decoded) {
            if (err) {
                return res.status(408).json(responseUtils.buildInvalidTokenResponse());
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(407).json(responseUtils.buildTokenNotFoundResponse());
    }
});

//Protected Routes
app.use(baseURL + "/user", user);
app.use(baseURL + "/media", media);

//Catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).json(responseUtils.buildNotFoundResponse());
});

console.log("Confidant API server started.");

module.exports = app;
