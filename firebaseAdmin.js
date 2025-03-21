// firebaseAdmin.js (Para el Backend)
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://eva2-practica.firebaseio.com",
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
