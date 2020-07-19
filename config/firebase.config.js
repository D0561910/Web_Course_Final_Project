// import firebase module
const admin = require("firebase-admin");

// load serviceAccountkey.json
const serviceAccount = require("./serviceAccountKey.json");

// firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://webcoursedatabase.firebaseio.com",
});

const firebase = admin.database();

module.exports = firebase;
