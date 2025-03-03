import { auth } from "/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Establecer Cookie de Sesión
function setSessionCookie(name, value, days) {
    let cookieString = `${name}=${value}; path=/; SameSite=Lax`;
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
    } else {
        cookieString += `; max-age=0`; // La cookie debería durar hasta que se cierra el navegador
    }
    document.cookie = cookieString;
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const mantenerSesion = document.getElementById("mantenerSesion").checked;
    const errorMessage = document.getElementById("error-message");

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar UID en una cookie (7 días si mantener sesión está activado, sino se elimina al cerrar el navegador)
        setSessionCookie("sessionToken", user.uid, mantenerSesion ? 7 : null);

        // Redirigir al mapa
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error en el inicio de sesión:", error.message);
        errorMessage.style.color = "red";
        errorMessage.textContent = error.message;
    }
});

