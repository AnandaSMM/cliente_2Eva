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


// // Importar Firebase desde el CDN
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// // Configuración de Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyBzfYf1ftohMkokGJ__1T_50ViCOVX9PT0",
//   authDomain: "eva2-practica.firebaseapp.com",
//   projectId: "eva2-practica",
//   storageBucket: "eva2-practica.appspot.com",
//   messagingSenderId: "666165419618",
//   appId: "1:666165419618:web:cf8d85b1941418549cfb3b",
//   measurementId: "G-DNNMV0EYYR",
// };

// // Inicializar Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// // Exportar Firebase para usarlo en otros archivos frontend
// export { auth, db, storage };