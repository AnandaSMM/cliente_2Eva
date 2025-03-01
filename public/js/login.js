import { auth } from "/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario autenticado:", userCredential.user);

        // Redirigir al dashboard
        window.location.href = "/dashboard";
    } catch (error) {
        console.error("Error en el inicio de sesión:", error.message);
        errorMessage.textContent = "Error: " + error.message;
    }
});
