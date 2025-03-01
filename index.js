const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Servir firebase.js manualmente
app.get("/firebase.js", (req, res) => {
    res.type("application/javascript");
    res.sendFile(path.join(__dirname, "firebase.js"));
});


// Rutas estáticas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/registro", (req, res) => res.sendFile(path.join(__dirname, "public", "registro.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
