import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { mostrarSeccion } from "./aside.js";

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
        map.remove(); // Destruye el mapa
    }
    document.getElementById('map').innerHTML = "";

    // Crear el mapa centrado en Madrid
    map = L.map('map', { maxZoom: 18, }).setView([40.4168, -3.7038], 13);

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

export async function cargarMapa2() {
    if (map && map.remove) {
        map.remove();
    }
    document.getElementById("map").innerHTML = "";

    // Inicializar el mapa con Leaflet
    map = L.map("map", { maxZoom: 18 }).setView([40.4168, -3.7038], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (!navigator.geolocation) {
        alert("❌ Tu navegador no soporta geolocalización");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
      
          map.setView([lat, lng], 15); // Centrar mapa en la ubicación
      
          L.marker([lat, lng])
            .addTo(map)
            .bindPopup("📍 Estás aquí")
            .openPopup();
        });

    const user = auth.currentUser;
    if (!user) {
        alert("Debes estar autenticado para agregar ubicaciones.");
        return;
    }

    try {
        const userRef = doc(db, "Usuario", user.uid);
        const userDoc = await getDoc(userRef);
        let userId = user.uid;

        map.on("click", function (e) {
            const { lat, lng } = e.latlng;
            document.getElementById('crearSpot').addEventListener('click', () => mostrarSeccion('seccionSpot'));
            document.getElementById("lat").value = lat;
            document.getElementById("long").value = lng;
        });

        document.getElementById("formularioNuevoSitio").addEventListener("submit", async function (event) {
            event.preventDefault();

            const lat = parseFloat(document.getElementById("lat").value);
            const lng = parseFloat(document.getElementById("long").value);
            const nombre = document.getElementById("nombre").value;
            const comentario = document.getElementById("comentario").value;
            const tipo = document.getElementById("tipo").value;
            const paraGrupos = document.getElementById("paraGrupos").checked;

            if (!userId || isNaN(lat) || isNaN(lng) || !nombre || !tipo) {
                alert("Datos inválidos. Verifica los campos.");
                return;
            }

            let bodyData = { userId, nombre, lat, lng, comentario, tipo };
            if (paraGrupos) {
                const grupoId = document.getElementById("grupoId").value;
                if (!grupoId) {
                    alert("Selecciona un grupo válido.");
                    return;
                }
                bodyData.grupo = grupoId;
            }

            try {
                const response = await fetch("http://localhost:3000/agregar-Ubicacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyData),
                });

                const result = await response.json();
                if (result.success) {
                    alert("Ubicación agregada con éxito!");
                    L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`<b id="nombre-${result.id}">${nombre}</b><br>
                <span id="comentario-${result.id}">${comentario}</span><br>
                <button onclick="editarUbicacion('${result.id}', ${lat}, ${lng})">✏ Editar</button>
                <button onclick="eliminarUbicacion('${result.id}', ${lat}, ${lng})">🗑 Borrar</button>`)
                        .openPopup();
                } else {
                    alert("Error al agregar la ubicación.");
                }
            } catch (error) {
                console.error("Error al enviar datos: ", error);
            }
        });

        // Eliminar ubicación
        async function eliminarUbicacion(id, lat, lng) {
            if (!confirm("¿Seguro que quieres eliminar esta ubicación?")) return;

            try {
                const response = await fetch(`http://localhost:3000/eliminar-Ubicacion/${id}`, {
                    method: "DELETE",
                });

                const result = await response.json();
                if (result.success) {
                    alert("Ubicación eliminada con éxito!");
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
                            map.removeLayer(layer);
                        }
                    });
                } else {
                    alert("Error al eliminar la ubicación.");
                }
            } catch (error) {
                console.error("Error al eliminar la ubicación: ", error);
            }
        }

        // Editar ubicación
        async function editarUbicacion(id, lat, lng) {
            const nuevoNombre = prompt("Nuevo nombre del sitio:", document.getElementById(`nombre-${id}`).innerText);
            const nuevoComentario = prompt("Nuevo comentario:", document.getElementById(`comentario-${id}`).innerText);

            if (!nuevoNombre || !nuevoComentario) return alert("No puedes dejar campos vacíos.");

            try {
                const response = await fetch(`http://localhost:3000/editar-Ubicacion/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre: nuevoNombre, comentario: nuevoComentario }),
                });

                const result = await response.json();
                if (result.success) {
                    alert("Ubicación actualizada!");
                    document.getElementById(`nombre-${id}`).innerText = nuevoNombre;
                    document.getElementById(`comentario-${id}`).innerText = nuevoComentario;
                } else {
                    alert("Error al actualizar la ubicación.");
                }
            } catch (error) {
                console.error("Error al actualizar la ubicación: ", error);
            }
        }

    } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("Error al cargar usuario.");
    }

}

///mostrar los mapas: general y personal
cargarMapa1();

document.getElementById("personal").addEventListener("click", () => {
    cargarMapa2();
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
