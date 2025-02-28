import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js"; // Ahora apunta al archivo correcto


const auth = getAuth(app);
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");

// Verificar si el usuario ya está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html"; // Redirige si ya está logueado
    }
});

// Manejo del formulario de inicio de sesión
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    if (!email || !password) {
        errorMessage.textContent = "Por favor, completa todos los campos.";
        return;
    }

    loginForm.querySelector("button").disabled = true; // Evitar doble envío

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html"; // Redirigir al dashboard si es exitoso
    } catch (error) {
        handleAuthError(error);
    } finally {
        loginForm.querySelector("button").disabled = false; // Rehabilitar botón
    }
});

// Manejo de errores
function handleAuthError(error) {
    const errorCodes = {
        "auth/invalid-email": "El formato del correo es inválido.",
        "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
        "auth/user-not-found": "No hay una cuenta con este correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde."
    };

    errorMessage.textContent = errorCodes[error.code] || "Error al iniciar sesión.";
}
