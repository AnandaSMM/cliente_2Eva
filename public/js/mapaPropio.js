import { auth, db } from "/firebase.js";
import { doc, getDoc,} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
 export async function cargarMapa2(map) {
  if (map && map.remove) {
    map.off(); 
    map.remove(); 
  }
  document.getElementById("map").innerHTML = "";

  // Inicializar el mapa con Leaflet
  map = L.map("map", { maxZoom: 18 }).setView([40.4168, -3.7038], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

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
      document.getElementById("seccionSpot").style.display = "block";
      document.getElementById("seccionAmigos").style.display = "none";
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
        const response = await fetch("http://localhost:3000//agregar-Ubicacion", {
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