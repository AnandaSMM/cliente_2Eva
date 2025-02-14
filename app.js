import firebase from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js";
// Required for side-effects
import "firebase/firestore";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    FIREBASE_CONFIGURATION
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


let body = document.querySelector("body");
body.appendChild(document.createElement("hr"));