import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase.js"; 

const auth = getAuth(app);

document.getElementById("logout").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            window.location.href = "login.html"; // Volver al login después de cerrar sesión
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
});
