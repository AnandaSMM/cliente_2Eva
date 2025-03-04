import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { mostrarSeccion } from "./aside.js";
import { cargarGruposSelect } from "./grupos.js";

let userId;
// Verificar autenticación en Firebase
onAuthStateChanged(auth, async (user) => {
    if (user) {
        cargarGruposSelect();
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
                // alert("✅ Notificaciones activadas.");
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
    cargarGruposSelect();

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
        alert("Tu navegador no soporta geolocalización");
        return;
    }

    // Mostrar ubicación del usuario
    navigator.geolocation.getCurrentPosition((position) => {
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

        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.sitiosPropios) {
                data.sitiosPropios.forEach(sitio => {
                    const { lat, lng, nombre, comentario } = sitio;
                    agregarMarcadorMapa(lat, lng, nombre, comentario);
                });
            }
        }

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
            const grupoId = document.getElementById("paraGrupos").value;

            if (!userId || isNaN(lat) || isNaN(lng) || !nombre || !tipo) {
                alert("Datos inválidos. Verifica los campos.");
                return;
            }

            let bodyData = { userId, nombre, lat, lng, comentario, tipo };
            if (grupoId && grupoId !== "Selecciona un grupo") {
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
                    agregarMarcadorMapa(lat, lng, nombre, comentario);
                } else {
                    alert("Error al agregar la ubicación.");
                }
            } catch (error) {
                console.error("Error al enviar datos: ", error);
            }
        });

    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
    }
}

// Función para agregar un marcador con eventos de edición/eliminación
function agregarMarcadorMapa(lat, lng, nombre, comentario) {
    const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
            <b id="nombre-${lat}-${lng}">${nombre}</b><br>
            <span id="comentario-${lat}-${lng}">${comentario}</span><br>
            <button id="editar-${lat}-${lng}">✏ Editar</button>
            <button id="eliminar-${lat}-${lng}">🗑 Borrar</button>
        `);

    marker.on('popupopen', () => {
        setTimeout(() => {
            const editarButton = document.getElementById(`editar-${lat}-${lng}`);
            const eliminarButton = document.getElementById(`eliminar-${lat}-${lng}`);

            if (editarButton) {
                editarButton.addEventListener("click", () => editarUbicacion(lat, lng));
            }
            if (eliminarButton) {
                eliminarButton.addEventListener("click", () => eliminarUbicacion(lat, lng));
            }
        }, 100);
    });
}

// Función para eliminar una ubicación
async function eliminarUbicacion(lat, lng) {
    const usuario = auth.currentUser;
    if (!usuario) {
        alert("No estás autenticado.");
        return;
    }

    if (confirm("¿Estás seguro de que quieres eliminar esta ubicación?")) {
        try {
            const response = await fetch(`http://localhost:3000/eliminar-Ubicacion/${usuario.uid}/${lat}/${lng}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (data.success) {
                alert("Ubicación eliminada correctamente");

                // Remover el marcador del mapa
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        const markerLatLng = layer.getLatLng();
                        if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
                            map.removeLayer(layer);
                        }
                    }
                });
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar ubicación:", error);
            alert("Hubo un problema al eliminar la ubicación.");
        }
    }
}


// Función para manejar el clic en el botón de editar
function editarUbicacion(lat, lng) {
    // Obtener los valores actuales del marcador
    const nombre = document.getElementById(`nombre-${lat}-${lng}`).textContent;
    const comentario = document.getElementById(`comentario-${lat}-${lng}`).textContent;

    // Rellenar los campos del formulario con los valores actuales
    document.getElementById("nuevoNombre").value = nombre;
    document.getElementById("nuevoComentario").value = comentario;

    // Mostrar el formulario de edición
    mostrarFormularioEdicion();

    // Guardar el lat y lng en el formulario para enviarlos al backend
    document.getElementById("latEdit").value = lat;
    document.getElementById("lngEdit").value = lng;

    // Manejar el submit del formulario de edición
    document.getElementById("formularioEditarSitio").addEventListener("submit", async function(event) {
        event.preventDefault();

        const nuevoNombre = document.getElementById("nuevoNombre").value;
        const nuevoComentario = document.getElementById("nuevoComentario").value;

        if (!nuevoNombre || !nuevoComentario) {
            alert("Debes completar todos los campos.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/editar-Ubicacion/${lat}/${lng}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nuevoNombre,
                    comentario: nuevoComentario,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar el marcador en el mapa
                actualizarMarcador(lat, lng, nuevoNombre, nuevoComentario);

                alert("Ubicación actualizada correctamente.");
                ocultarFormularioEdicion();
            } else {
                alert("Error al actualizar la ubicación.");
            }
        } catch (error) {
            console.error("Error al editar la ubicación: ", error);
            alert("Hubo un error al actualizar la ubicación.");
        }
    });
}

// Función para actualizar el marcador en el mapa
function actualizarMarcador(lat, lng, nuevoNombre, nuevoComentario) {
    // Buscar el marcador en el mapa y actualizar su contenido
    map.eachLayer(layer => {
        if (layer.getLatLng && layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
            layer.bindPopup(`
                <b id="nombre-${lat}-${lng}">${nuevoNombre}</b><br>
                <span id="comentario-${lat}-${lng}">${nuevoComentario}</span><br>
                <button id="editar-${lat}-${lng}">✏ Editar</button>
                <button id="eliminar-${lat}-${lng}">🗑 Borrar</button>
            `).openPopup();
        }
    });
}

// Funciones para mostrar/ocultar el formulario de edición
function mostrarFormularioEdicion() {
    document.getElementById("formularioEdicionContainer").style.display = "block";
}

function ocultarFormularioEdicion() {
    document.getElementById("formularioEdicionContainer").style.display = "none";
}

///mostrar los mapas: general y personal
cargarMapa1();

document.getElementById("personal").addEventListener("click", () => {
    document.querySelector("#encabezado h2").textContent = "Mi Mapa Personalizado";
    cargarMapa2();
});

document.getElementById("general").addEventListener("click", () => {
    document.querySelector("#encabezado h2").textContent = "Mapa General de Lugares Turísticos y Restaurantes";
    mostrarNotificacion("Los datos se cargarán en breve", ". . .");
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
