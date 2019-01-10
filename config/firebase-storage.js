//config/firebase-storage.js

//Firebase Admin
var admin = require("firebase-admin");

var serviceAccount = require("./confidant-api-228201-firebase-adminsdk-rmmr5-f775beb4b8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "https://confidant-api-228201.firebaseio.com"
});

var bucket = admin.storage().bucket();

module.exports = {
    bucket: bucket
};