const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { db } = require("./firebaseAdmin"); // Importar Firestore y Auth
const admin =require("firebase-admin");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Servir firebase.js manualmente
app.get("/firebase.js", (req, res) => {
    res.type("application/javascript");
    res.sendFile(path.join(__dirname, "firebase.js"));
});

// Verificar sesión con cookie UID
app.get("/", (req, res) => {
    if (req.cookies.sessionToken) {
        res.redirect("/index");
    } else {
        res.redirect("/login");
    }
});

// Rutas estáticas
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/registro", (req, res) => res.sendFile(path.join(__dirname, "public", "registro.html")));
app.get("/index", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// **Endpoint para agregar ubicación**
app.post("/agregar-Ubicacion", async (req, res) => {
  try {
    const { userId, nombre, lat, lng, comentario, tipo, grupo } = req.body;

    if (!userId || !nombre || isNaN(lat) || isNaN(lng) || !tipo) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    if (grupo) {
      // Si la ubicación es para un grupo
      const grupoRef = db.collection("Grupo").doc(grupo);
      const grupoDoc = await grupoRef.get();

      if (!grupoDoc.exists) {
        return res.status(404).json({ error: "El grupo no existe" });
      }

      await grupoRef.update({
        sitiosCompartidos: admin.firestore.FieldValue.arrayUnion({ nombre, lat, lng, comentario, tipo }),
      });

      return res.json({ success: true, message: "Ubicación agregada al grupo" });
    }

    // Si la ubicación es personal, agregar al array `sitiosPropios` del usuario
    const userRef = db.collection("Usuario").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "El usuario no existe" });
    }

    await userRef.update({
      sitiosPropios: admin.firestore.FieldValue.arrayUnion({ nombre, lat, lng, comentario, tipo }),
    });

    res.json({ success: true, message: "Ubicación agregada a sitios propios" });
  } catch (error) {
    console.error("Error al agregar ubicación:", error.message);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
});

app.delete("/eliminar-Ubicacion/:usuario/:lat/:lng", async (req, res) => {
  try {
    const { usuario, lat, lng } = req.params;

    // Obtener la referencia al usuario
    const userRef = db.collection("Usuario").doc(usuario);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let sitios = userDoc.data().sitiosPropios || [];

    // Filtrar las ubicaciones para eliminar la que tiene la latitud y longitud dadas
    const nuevosSitios = sitios.filter(sitio => 
      sitio.lat !== parseFloat(lat) || sitio.lng !== parseFloat(lng)
    );

    // Actualizar Firestore con la nueva lista de ubicaciones
    await userRef.update({ sitiosPropios: nuevosSitios });

    res.json({ success: true, message: "Ubicación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar ubicación:", error);
    res.status(500).json({ error: "Error al eliminar la ubicación" });
  }
});

// Editar una ubicación de la colección
app.put("/editar-Ubicacion/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { nombre, comentario } = req.body;

    // Validar si los datos necesarios están presentes
    if (!nombre || !comentario) {
      return res.status(400).json({ error: "Nombre y comentario son requeridos" });
    }

    const usuario = auth.currentUser;
    // Obtener el documento del usuario
    const userRef = db.collection("Usuario").doc(usuario);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener los sitios del usuario
    let sitios = userDoc.data().sitiosPropios || [];

    // Buscar y actualizar la ubicación
    let ubicacionIndex = sitios.findIndex(sitio => sitio.lat === parseFloat(lat) && sitio.lng === parseFloat(lng));

    if (ubicacionIndex === -1) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    // Modificar el nombre y comentario
    sitios[ubicacionIndex].nombre = nombre;
    sitios[ubicacionIndex].comentario = comentario;

    // Actualizar el documento del usuario con la lista de sitios actualizada
    await userRef.update({ sitiosPropios: sitios });

    res.json({ success: true, message: "Ubicación actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar ubicación:", error);
    res.status(500).json({ error: "Error al editar la ubicación" });
  }
});


// Servir la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

