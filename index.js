const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

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


// Servir la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

