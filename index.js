const express = require("express");
const path = require("path");
const { auth } = require("./firebase");

const app = express();

app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Rutas estáticas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/registro", (req, res) => res.sendFile(path.join(__dirname, "public", "registro.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

