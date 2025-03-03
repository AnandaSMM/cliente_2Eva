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

// Ruta para agregar un sitio a Firestore
app.post("/agregar-sitio", async (req, res) => {
    try {
        const { nombre, latitud, longitud, descripcion } = req.body;
        if (!nombre || !latitud || !longitud) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }
        const nuevoSitio = {
            nombre,
            latitud,
            longitud,
            descripcion: descripcion || "",
        };
        const sitioRef = await db.collection("rupo1").add(nuevoSitio);
        res.status(201).json({ id: sitioRef.id, mensaje: "Sitio agregado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el sitio", detalle: error.message });
    }
});


function agregarSitioAJAX(sitio) {
    fetch('http://localhost:3000/agregar-sitio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sitio)  // Enviar latitud y longitud al backend
    })
    .then(response => response.json())
    .then(data => {
        alert(data.mensaje); // Mostrar mensaje de éxito
    })
    .catch(error => {
        console.error('Error al agregar sitio:', error);
    });
}

// Servir la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
