// Importar Firebase y sus servicios necesarios
import { auth, db } from "/firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Actualizar perfil con el nombre del usuario
        await updateProfile(user, {
            displayName: name
        });

        console.log("Usuario registrado:", user);
        message.style.color = "green";
        message.textContent = "Registro exitoso. Redirigiendo...";

        // Redirigir al dashboard después de unos segundos
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 2000);

    } catch (error) {
        console.error("Error en el registro:", error.message);
        message.style.color = "red";
        message.textContent = "Error: " + error.message;
    }
});
