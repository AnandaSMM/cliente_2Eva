import { auth } from "/firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Verificar autenticación en Firebase
onAuthStateChanged(auth, (user) => {
    if (!user) {
        document.cookie = "sessionToken=; path=/; max-age=0;"; // Borrar cookie
        window.location.href = "login.html"; // Redirigir al login
    } else {
        document.getElementById("user-email").textContent = user.email;
    }
});

// Crear el mapa centrado en Madrid
const map = L.map('map').setView([40.4168, -3.7038], 13); 

// Añadir capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Crear un grupo de "clusters" para mejorar el rendimiento
const markers = L.markerClusterGroup();

// Petición a Overpass API para obtener lugares turísticos y restaurantes
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
        alert("Datos cargados correctamente.");
    })
    .catch(error => {
        console.error("Error al obtener datos:", error);
        alert("Hubo un problema al obtener los datos. Inténtalo más tarde.");
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
