//config/auth.js

//Facebook Callback
var facebookCallback = (accessToken, refreshToken, userFB, done) => {
  console.log(" -----------------------------//--------------------------- ");
  console.log(" --------> ACCESS TOKEN " + accessToken);
  console.log(" -----------------------------//--------------------------- ");
  console.log(" --------> REFRESH TOKEN " + refreshToken);
  console.log(" -----------------------------//--------------------------- ");
  console.log(" --------> USERFB CALLBACK " + userFB.displayName);
  console.log(" -----------------------------//--------------------------- ");
  console.log(" --------> USERFB JSON " + JSON.stringify(userFB._json));
  console.log(" -----------------------------//--------------------------- ");
  console.log(" --------> USERFB OBJECT" + JSON.stringify(userFB));
  console.log(" -----------------------------//--------------------------- ");
  done(null, userFB);
};

module.exports = {
  facebookAuth: {
    clientID: '1405487309509241',
    clientSecret: 'f6104678b4554303d247e11febd53d6f',
    callbackURL: 'https://confidant-api.herokuapp.com/confidant/api/v1/users/facebook/callback',
    profileFields: ["email", "displayName", "birthday", "gender"]
  },
  facebookCallback: facebookCallback
};