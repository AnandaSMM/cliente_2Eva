import { auth, db } from "/firebase.js";
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { cargarMapa2 } from "./mapaPropio.js";

let userId;
// Verificar autenticación en Firebase
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        try {
            // Referencia al documento del usuario en Firestore
            const userDocRef = doc(db, "Usuario", userId);

            // Obtener el documento
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data(); // Obtener los datos
                console.log("Nombre del usuario:", userData.nombre);

                document.getElementById("nombreUsuario").textContent = userData.nombre;
            } else {
                console.log("No se encontró el documento del usuario en Firestore");
            }
        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
        }
    } else {
        // Borrar la cookie de sesión y redirigir al login
        document.cookie = "sessionToken=; path=/; max-age=0;";
        window.location.href = "login.html";
    }
});


//notificaciones
function solicitarPermisoNotificaciones() {
    // Verifica si el navegador soporta las notificaciones
    if (!("Notification" in window)) {
        alert("Tu navegador no soporta notificaciones.");
        return;
    }
    // Funcion para solicitar permiso de notificaciones
    function preguntar() {
        Notification.requestPermission().then((permiso) => {
            if (permiso === "granted") {
                alert("✅ Notificaciones activadas.");
            } else {
                setTimeout(() => {
                    const aceptar = confirm("❗Para mejorar tu experiencia, activa las notificaciones. ¿Quieres intentarlo de nuevo?");
                    if (aceptar) {
                        preguntar();
                    }
                }, 30000); // Vuelve a preguntar después de 3 segundos
            }
        });
    }
    preguntar();
}

// Crea la notificaciones
function mostrarNotificacion(mensaje, titulo) {
    const notificacion = new Notification(titulo, {
        body: mensaje,
        icon: "../img/icono.jpg",
        tag: "notificacion-1",
    });
}

// Llamar a la funcion cuando se cargue la página
solicitarPermisoNotificaciones();

let map = null;
function cargarMapa1() {
    if (map && map.remove) {
        map.off(); // Desactiva eventos
        map.remove(); // Destruye el mapa
    }
    document.getElementById('map').innerHTML = "";

    // Crear el mapa centrado en Madrid
    map = L.map('map', {maxZoom: 18,}).setView([40.4168, -3.7038], 13);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Crear un grupo de "clusters" para mejorar el rendimiento
    const markers = L.markerClusterGroup();

    // Peticion a Overpass API para obtener lugares turísticos y restaurantes
    const overpassQuery = `
    [out:json][timeout:25];
    area[name="Madrid"]->.searchArea;
    (
        node["tourism"](area.searchArea);
        node["amenity"="restaurant"](area.searchArea);
    );
    out body center 50;  // 👈 Máximo 50 resultados
`;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.elements || data.elements.length === 0) {
                alert("No se encontraron lugares en la zona.");
                return;
            }

            data.elements.forEach(element => {
                if (element.lat && element.lon) {
                    const name = element.tags.name || "Lugar sin nombre";
                    const type = element.tags.tourism ? "🗿 Turismo" : "🍽 Restaurante";

                    // Crear marcador y agregarlo al cluster
                    const marker = L.marker([element.lat, element.lon])
                        .bindPopup(`<strong>${name}</strong><br>${type}`);
                    markers.addLayer(marker); // Agregar al grupo de clusters
                }
            });
            map.addLayer(markers); // Agregar el cluster al mapa
            mostrarNotificacion("Datos cargados correctamente.", "✅");
        })
        .catch(error => {
            console.error("Error al obtener datos:", error);
            alert("Hubo un problema al obtener los datos. Inténtalo más tarde.");
        });
};

///mostrar los mapas: general y personal
cargarMapa1();

document.getElementById("personal").addEventListener("click", () => {
    cargarMapa2(map);
});

document.getElementById("general").addEventListener("click", () => {
    mostrarNotificacion("Los datos se cargaran en breve", ". . .");
    cargarMapa1();
});


// Cerrar sesión
document.getElementById("logout").addEventListener("click", async () => {
    try {
        await signOut(auth);
        document.cookie = "sessionToken=; path=/; max-age=0;"; // Borrar cookie
        window.location.href = "login.html"; // Redirigir al login
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});
