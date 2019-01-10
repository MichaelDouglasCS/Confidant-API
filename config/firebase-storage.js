//config/firebase-storage.js

//Firebase Admin
var firebase = require("firebase-admin");

var config = {
  apiKey: "AIzaSyC8FNp-fywFyjYt3Y43VCVOf8hRcEfRALk",
  authDomain: "confidant-api-228201.firebaseapp.com",
  databaseURL: "https://confidant-api-228201.firebaseio.com",
  projectId: "confidant-api-228201",
  storageBucket: "confidant-api-228201.appspot.com",
  messagingSenderId: "963343962205"
};
firebase.initializeApp(config);

var bucket = firebase.storage().bucket();

module.exports = {
    bucket: bucket
};