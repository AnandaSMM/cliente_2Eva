import { db, auth } from "./firebase.js";
import { doc, getDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Referencias al formulario y lista de amigos
const friendNameInput = document.getElementById("friendName");
const addFriendButton = document.querySelector("#seccionAmigos button");
const friendsList = document.getElementById("friendsList");

// Función para agregar un amigo (solo si está registrado)
async function addFriend() {
    const friendName = friendNameInput.value.trim();
    const user = auth.currentUser; // Usuario autenticado

    if (!friendName) {
        alert("Por favor, ingresa un nombre válido.");
        return;
    }

    if (!user) {
        alert("Debes estar autenticado para agregar amigos.");
        return;
    }

    try {
        // Obtener datos del usuario autenticado
        const userRef = doc(db, "Usuario", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            alert("Tu usuario no está registrado en Firestore.");
            return;
        }

        // Buscar al usuario amigo en Firestore por su nombre
        const q = query(collection(db, "Usuario"), where("nombre", "==", friendName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("No se encontró un usuario registrado con ese nombre.");
            return;
        }

        const friendDoc = querySnapshot.docs[0]; // Tomamos el primer resultado (se asume que los nombres son únicos)
        const friendRef = doc(db, "Usuario", friendDoc.id);

        // Verificar que no se agregue a sí mismo
        if (friendDoc.id === user.uid) {
            alert("No puedes agregarte a ti mismo como amigo.");
            return;
        }

        // Agregar el amigo al usuario autenticado
        await updateDoc(userRef, {
            amigos: arrayUnion(friendName)
        });

        // Agregar el usuario autenticado a la lista de amigos del otro usuario
        await updateDoc(friendRef, {
            amigos: arrayUnion(userDoc.data().nombre)
        });

        // Agregar visualmente el amigo en la lista
        const newFriendItem = document.createElement("li");
        newFriendItem.textContent = friendName;
        friendsList.appendChild(newFriendItem);

        // Limpiar campo
        friendNameInput.value = "";
        alert(`Ahora ${friendName} es tu amigo.`);
    } catch (error) {
        console.error("Error al agregar amigo:", error);
        alert("Hubo un error al agregar el amigo.");
    }
}

// Función para cargar amigos al iniciar sesión
async function loadFriends() {
    const user = auth.currentUser;
    if (!user) return;

    friendsList.innerHTML = ""; // Limpiar lista antes de cargar

    try {
        const userRef = doc(db, "Usuario", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const amigosArray = userDoc.data().amigos || [];
            amigosArray.forEach((friendName) => {
                const friendItem = document.createElement("li");
                friendItem.textContent = friendName;
                friendsList.appendChild(friendItem);
            });
        }
    } catch (error) {
        console.error("Error al cargar amigos:", error);
    }
}

// Evento para agregar amigos
addFriendButton.addEventListener("click", addFriend);

// Cargar amigos cuando el usuario se autentica
auth.onAuthStateChanged((user) => {
    if (user) {
        loadFriends();
    }
});
