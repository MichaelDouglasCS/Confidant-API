var express = require("express");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var compression = require("compression");
var responseUtils = require("./api/utils/response.utils");

var databaseConfig = require("./config/database");
var configAuth = require("./config/auth");

var users = require("./api/users/users.resources");
// var intakes = require("./api/intakes/intakes.resources");
// var facilities = require("./api/facilities/facilities.resources");
// var investigations = require("./api/investigation/investigation.resources");

var app = express();
// To compress the responses:
app.use(compression());

var baseURL = "/confidant/api";

//MONGOOSE INIT
var mongoOptions = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 300000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 300000 } }
};
var mongoURL = (process.env.MONGODB_URL || databaseConfig.development.mongoURL) + "?socketTimeoutMS=120000";
mongoose.Promise = global.Promise;
mongoose.connect(mongoURL, mongoOptions);

var db = mongoose.connection;
db.on("error", function(callback) {
    console.error("Error connecting into mongodb: " + callback);
});
db.once("open", function() {
    console.log("MongoDB - Connection successfully");
});

// Config
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Config Passport
app.use(passport.initialize());
passport.use(new FacebookStrategy(configAuth.facebookAuth, configAuth.facebookCallback));

//Unprotected routes:
app.use(baseURL + "/v1/users", users);
// app.use(baseURL + "/v1/analytics", analytics);
// if (process.env.ENVIRONMENT != "HOMOLOG" || process.env.ENVIRONMENT != "PROD") {
//   app.use(baseURL + "/v1/testSecurity", testSecurity);
//   app.use("/api", mock);
// }

// app.use(function(req, res, next) {
//     // Check the request Header to get the authentication Token:
//     let tokenHeader = req.headers["x-access-token"];
//     if (tokenHeader == null || tokenHeader == "") {
//         tokenHeader = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWdpc3RyeSI6IjEiLCJuYW1lIjoiSm_Do28gSG9yaXN0YSBBbmNoaWV0YSIsInVuaXQiOiJ2dy1hbmNoaWV0YSIsImNhdGVnb3J5IjoidnctaG9yaXN0IiwiaWF0IjoxNDk2NjcwMDE4LCJleHAiOjE1MjU3MDA0MTh9.h6nirLcjzD1a-M07g2XwJmuBNnIio6CEggrJGQ_WkDY";
//     }
//     // Verify the token:
//     if (tokenHeader) {
//         // Verifies secret and checks exp
//         jwt.verify(tokenHeader, jwtSettings.secretOrKey, function(err, decoded) {
//             if (err) {
//                 return res.status(403).json(responseUtils.buildInvalidTokenResponse());
//             } else {
//                 // If everything is good, save the user information on request for use in other routes
//                 req.userInfo = decoded;
//                 next();
//             }
//         });
//     } else {
//         return res.status(403).json(responseUtils.buildTokenNotFoundResponse());
//     }
// });

// Protected Routes:
// app.use(baseURL + "/v1/intakes", intakes);
// app.use(baseURL + "/v1/facility", facilities);
// app.use(baseURL + "/v1/investigation", investigations);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json(responseUtils.buildNotFoundResponse());
});

console.log("Confidant API server started.");

module.exports = app;
