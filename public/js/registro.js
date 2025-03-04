// Importar Firebase y sus servicios necesarios
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { setDoc, doc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        message.style.color = "red";
        message.textContent = "Las contraseñas no coinciden.";
        return;
    }

    try {
        // Verificar si el nombre ya está en uso en la colección "Usuario"
        const q = query(collection(db, "Usuario"), where("nombre", "==", name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            message.style.color = "red";
            message.textContent = "El nombre ya está en uso. Por favor, elige otro.";
            return;
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Crear documento en Firestore dentro de la colección "Usuario"
        await setDoc(doc(db, "Usuario", user.uid), {
            nombre: name,
            email: email,
            sitiosPropios: [],
            grupos: [],
            amigos: []
        });

        message.style.color = "green";
        message.textContent = "Registro exitoso. Redirigiendo...";

        // Redirigir al mapa después de unos segundos
        setTimeout(() => {
            window.location.href = "/index";
        }, 2000);

    } catch (error) {
        console.error("Error en el registro:", error.message);
        message.style.color = "red";
        message.textContent = error.message;
    }
});
