import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);
const form = document.getElementById("formRegistro");
const message = document.getElementById("message");

// Manejo del formulario de registro
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    // Validaciones en frontend
    if (name.length < 3) {
        showMessage("El nombre debe tener al menos 3 caracteres.");
        return;
    }
    if (password.length < 6) {
        showMessage("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    form.querySelector("button").disabled = true; // Bloquear botón durante la petición

    try {
        // Verificar si el nombre ya está registrado en Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            showMessage("El nombre ya está en uso. Prueba con otro.");
            form.querySelector("button").disabled = false;
            return;
        }

        // Crear el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar datos en Firestore
        await addDoc(usersRef, { uid: user.uid, name, email });

        showMessage(`✅ Usuario registrado con éxito: ${user.email}`, true);

        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    } catch (error) {
        handleAuthError(error);
    } finally {
        form.querySelector("button").disabled = false; // Rehabilitar botón
    }
});

// Función para mostrar mensajes de usuario
function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

// Manejo de errores de autenticación
function handleAuthError(error) {
    const errorCodes = {
        "auth/email-already-in-use": "❌ El correo ya está en uso. Prueba con otro.",
        "auth/invalid-email": "❌ El formato del correo es inválido.",
        "auth/weak-password": "❌ La contraseña es muy débil.",
        "auth/operation-not-allowed": "❌ El registro está deshabilitado.",
    };

    showMessage(errorCodes[error.code] || `❌ Error: ${error.message}`);
}
