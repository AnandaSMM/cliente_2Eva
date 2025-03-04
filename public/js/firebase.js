import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzfYf1ftohMkokGJ__1T_50ViCOVX9PT0",
  authDomain: "eva2-practica.firebaseapp.com",
  projectId: "eva2-practica",
  storageBucket: "eva2-practica.appspot.com",
  messagingSenderId: "666165419618",
  appId: "1:666165419618:web:cf8d85b1941418549cfb3b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };