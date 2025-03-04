const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-key.json")),
});

const db = admin.firestore();
const app = express();

app.use(express.json());
app.use(cors()); // Permite peticiones desde el frontend

// 🟢 **Endpoint para agregar ubicación**
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

// 🟢 **Iniciar servidor**
app.listen(3000, () => console.log("✅ Servidor corriendo en http://localhost:3000"));


// eliminar una ubicación de la coleccion
app.delete("/delete-location/:usuario/:nombre", async (req, res) => {
  try {
    const { usuario, nombre } = req.params;

    const locationRef = db.collection("Usuario").doc(usuario).collection("sitiosPropios").doc(nombre);
    const locationDoc = await locationRef.get();

    if (!locationDoc.exists) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }
    // Eliminar de la subcoleccion
    await locationRef.delete();
    // Eliminar del array sitiosPropios
    const userRef = db.collection("Usuario").doc(usuario);
    await userRef.update({
      sitiosPropios: admin.firestore.FieldValue.arrayRemove(locationDoc.data()),
    });

    res.json({ success: true, message: "Ubicación eliminada" });
  } catch (error) {
    console.error("Error al eliminar ubicación:", error);
    res.status(500).json({ error: "Error al eliminar la ubicación" });
  }
});

// Servidor en el puerto 3000
app.listen(3000, () => console.log("🚀 Servidor corriendo en el puerto 3000"));
