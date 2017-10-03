//config/firebase-storage.js

//Firebase Admin
var admin = require("firebase-admin");

var serviceAccount = require("./confidant-7d506-firebase-adminsdk-22wrj-32d8c66a78");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "confidant-7d506.appspot.com"
});

var bucket = admin.storage().bucket();

module.exports = {
    bucket: bucket
};