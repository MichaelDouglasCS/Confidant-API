//config/auth.js

//Facebook Callback
var facebookCallback = (accessToken, refreshToken, userFB, done) => {
    done(null, userFB);
};

module.exports = {
  facebookAuth: {
    clientID: "1405487309509241",
    clientSecret: "f6104678b4554303d247e11febd53d6f",
    callbackURL: "http://localhost:3000/confidant/api/v1/users/facebook/callback",
    profileFields: ["email", "displayName", "birthday", "gender"]
  },
  facebookCallback: facebookCallback
};