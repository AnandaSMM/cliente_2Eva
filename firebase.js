const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

// Credenciales desde un archivo JSON
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://eva2-practica.firebaseio.com",
});

const db = admin.firestore();
const auth = admin.auth();

// Configuración del SDK de Firebase para cliente
const firebaseConfig = {
  apiKey: "AIzaSyBzfYf1ftohMkokGJ__1T_50ViCOVX9PT0",
  authDomain: "eva2-practica.firebaseapp.com",
  projectId: "eva2-practica",
  storageBucket: "eva2-practica.appspot.com",
  messagingSenderId: "666165419618",
  appId: "1:666165419618:web:cf8d85b1941418549cfb3b",
  measurementId: "G-DNNMV0EYYR",
};

// Inicializa Firebase en el lado del cliente
const firebaseApp = initializeApp(firebaseConfig);
const clientDb = getFirestore(firebaseApp);
const clientAuth = getAuth(firebaseApp);

module.exports = { db, auth, clientDb, clientAuth };
