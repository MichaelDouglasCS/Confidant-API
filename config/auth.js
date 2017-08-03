//config/auth.js

//Facebook Callback
var facebookCallback = (accessToken, refreshToken, userFB, done) => {
    console.log("-------->ACCESS TOKEN " + accessToken);
    console.log("-------->REFRESH TOKEN " + refreshToken);
    console.log("-------->USERFB CALLBACK " + userFB.displayName);
     console.log("-------->USERFB CALLBACK JSON EMAIL " + userFB._json.email);
    console.log("-------->USERFB CALLBACK EMAIL " + userFB.emails[0].value);
    done(null, userFB);
};

module.exports = {
  facebookAuth: {
    clientID: '1405487309509241',
    clientSecret: 'f6104678b4554303d247e11febd53d6f',
    callbackURL: 'https://confidant-api.herokuapp.com/confidant/api/v1/users/facebook/callback',
    profileFields: ['emails', 'displayName', 'age_range', 'gender']
  },
  facebookCallback: facebookCallback
};