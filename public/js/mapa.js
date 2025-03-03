import { auth, db } from "/firebase.js";
import { doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
                // alert("✅ Notificaciones activadas.");
            } else {
                setTimeout(() => {
                    const aceptar = confirm("❗Para mejorar tu experiencia, activa las notificaciones. ¿Quieres intentarlo de nuevo?");
                    if (aceptar) {
                        preguntar();
                    }
                }, 3000); // Vuelve a preguntar después de 3 segundos
            }
        });
    }
    preguntar();
}

// Crea la notificaciones
function mostrarNotificacion(mensaje, titulo) {
    const notificacion = new Notification(titulo, {
        body: mensaje,
        icon: "./img/icono.jpg",
        tag: "notificacion-1",
    });
}

// Llamar a la funcion cuando se cargue la página
solicitarPermisoNotificaciones();
let map = null;

function cargarMapa1() {
    if (map !== null) {
        map.remove();
        document.getElementById('map').innerHTML = "";
    }
    // Crear el mapa centrado en Madrid
    map = L.map('map').setView([40.4168, -3.7038], 13);

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



function cargarMapa2() {
    if (typeof map !== "undefined" && map !== null) {
        map.remove();
        document.getElementById('map').innerHTML = "";
    }
    
    // Inicializar el mapa con Leaflet
    map = L.map('map').setView([40.4168, -3.7038], 13);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    async function cargarUbicaciones() {
        try {
            const querySnapshot = await getDocs(collection(db, "Usuario"));

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log("Ubicaciones:", data.ubicaciones);

                if (data.ubicaciones && Array.isArray(data.ubicaciones)) {
                    data.ubicaciones.forEach((ubicacion) => {
                        agregarMarcador(ubicacion.lat, ubicacion.lng);
                    });
                }
            });
        } catch (error) {
            console.error("Error al cargar ubicaciones:", error);
        }
    }

    // Función para agregar un marcador en el mapa
    function agregarMarcador(lat, lng) {
        L.marker([lat, lng])
            .addTo(map)
            .bindPopup("Ubicación guardada").openPopup();
    }

    // Evento para capturar clics en el mapa
    map.on("click", function (e) {
        const { lat, lng } = e.latlng;

        document.getElementById("seccionSpot").style.display = "block";
        document.getElementById("seccionAmigos").style.display = "none";
        document.getElementById("lat").value = lat;
        document.getElementById("long").value = lng;
    });

    document.getElementById("ubicacionForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const lat = parseFloat(document.getElementById("lat").value);
        const lng = parseFloat(document.getElementById("long").value);
        if (!userId) {
            alert("Error: No se encontró el usuario.");
            return;
        }

        const nombre = document.getElementById("nombre").value;
        const comentario = document.getElementById("comentario").value;
        const tipo = document.getElementById("tipo").value;
        const paraGrupos = document.getElementById("paraGrupos").value;

        // Buscar el ID real del grupo
        let grupoId = null;
        if (paraGrupos) {
            const idGrupo = query(collection(db, "Grupo"), where("nombre", "==", paraGrupos));
            const querySnapshot = await getDocs(idGrupo);

            if (querySnapshot.empty) {
                alert("No se encontró un grupo registrado con ese nombre.");
                return;
            }
            grupoId = querySnapshot.docs[0];
        }

        if (!nombre || !tipo) {
            alert("El nombre y el tipo no pueden estar vacíos");
            return;
        }

        let ruta = paraGrupos 
            ? "http://localhost:3000/api/agregar-Ubicacion-Grupo" 
            : "http://localhost:3000/api/agregar-Ubicacion-Mia";

        let bodyData = paraGrupos 
            ? { grupo: grupoId, nombre, lat, lng, comentario, tipo } 
            : { usuario: userId, nombre, lat, lng, comentario, tipo };

        try {
            const response = await fetch(ruta, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();
            console.log(data.mensaje);

            // Agregar marcador al mapa después de guardar
            agregarMarcador(lat, lng);

            // Resetear el formulario y ocultarlo
            document.getElementById("ubicacionForm").reset();
        } catch (error) {
            console.error("Error al guardar ubicación:", error);
            alert("Error al guardar la ubicación");
        }
    });

    // Cargar ubicaciones cuando el DOM esté listo
    cargarUbicaciones();
}

///mostrar los mapas: general y personal
cargarMapa1();// cargar el general por defecto

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
