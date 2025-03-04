import { db, auth } from "./firebase.js";
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Referencias a los elementos del DOM
const groupNameInput = document.getElementById("groupName");
const crearGrupoBoton = document.getElementById("crearGrupoBoton");
const friendsList = document.getElementById("friendsListGrupos"); 
const groupsList = document.getElementById("groupsList");

// Función para obtener amigos del usuario autenticado
export async function cargarAmigos() {
    const user = auth.currentUser;
    if (!user) return;

    friendsList.innerHTML = ""; // Limpiar lista

    // Obtener datos del usuario autenticado
    const userDoc = await getDoc(doc(db, "Usuario", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        userData.amigos.forEach((friendName) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = friendName;
            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(friendName));
            friendsList.appendChild(li);
        });
    }
}

// Función para crear un grupo
async function crearGrupo() {
    const groupName = groupNameInput.value.trim();
    const user = auth.currentUser;

    if (!groupName) {
        alert("Por favor, ingresa un nombre para el grupo.");
        return;
    }
    if (!user) {
        alert("Debes estar autenticado.");
        return;
    }

    // Obtener el nombre real del usuario autenticado
    const userDoc = await getDoc(doc(db, "Usuario", user.uid));
    if (!userDoc.exists()) {
        alert("Error: Usuario no encontrado en Firestore.");
        return;
    }
    const userName = userDoc.data().nombre; // Nombre real del usuario autenticado

    // Obtener amigos seleccionados
    const selectedFriends = [...friendsList.querySelectorAll("input:checked")].map(input => input.value);

    // Verificar que haya al menos un amigo seleccionado
    if (selectedFriends.length === 0) {
        alert("Selecciona al menos un amigo para el grupo.");
        return;
    }

    try {
        // Incluir al usuario autenticado en el grupo
        const participantes = [userName, ...selectedFriends];

        // Guardar el grupo en Firestore
        const groupRef = await addDoc(collection(db, "Grupo"), {
            nombre: groupName,
            participantes: participantes,
            sitiosCompartidos: []
        });

        const groupId = groupRef.id;

        // Agregar el ID del grupo a cada usuario participante
        for (const friendName of participantes) {
            const userQuery = query(collection(db, "Usuario"), where("nombre", "==", friendName));
            const userSnapshot = await getDocs(userQuery);

            userSnapshot.forEach(async (docSnap) => {
                const userRef = doc(db, "Usuario", docSnap.id);
                await updateDoc(userRef, {
                    grupos: arrayUnion(groupId) // Añadir grupo al array de grupos
                });
            });
        }

        alert("Grupo creado exitosamente.");
        groupNameInput.value = "";
        cargarGrupos(); // Recargar la lista de grupos

    } catch (error) {
        console.error("Error al crear el grupo:", error);
        alert("Hubo un error al crear el grupo.");
    }
}

// Función para cargar los grupos del usuario autenticado
async function cargarGrupos() {
    const user = auth.currentUser;
    if (!user) return;

    groupsList.innerHTML = ""; // Limpiar lista

    // Obtener datos del usuario autenticado
    const userDoc = await getDoc(doc(db, "Usuario", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        
        for (const groupId of userData.grupos) {
            const groupDoc = await getDoc(doc(db, "Grupo", groupId));
            if (groupDoc.exists()) {
                const groupData = groupDoc.data();
                const li = document.createElement("li");
                li.textContent = groupData.nombre;
                groupsList.appendChild(li);
            }
        }
    }
}

export async function cargarGruposSelect() {
    const user = auth.currentUser;
    if (!user) return;

    const selectGrupos = document.getElementById("paraGrupos");
    selectGrupos.innerHTML = `<option value="">Selecciona un grupo</option>`; // Reset

    try {
        // Obtener datos del usuario autenticado
        const userDoc = await getDoc(doc(db, "Usuario", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            for (const groupId of userData.grupos) {
                const groupDoc = await getDoc(doc(db, "Grupo", groupId));
                if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    const option = document.createElement("option");
                    option.value = groupId; // ID del grupo
                    option.textContent = groupData.nombre; // Nombre del grupo
                    selectGrupos.appendChild(option);
                }
            }
        }
    } catch (error) {
        console.error("Error al cargar grupos:", error);
    }
}

// Eventos
crearGrupoBoton.addEventListener("click", crearGrupo);
auth.onAuthStateChanged((user) => {
    if (user) {
        cargarGrupos();
    }
});
