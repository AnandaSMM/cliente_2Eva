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
        res.redirect("/mapa");
    } else {
        res.redirect("/login");
    }
});

// Rutas estáticas
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/registro", (req, res) => res.sendFile(path.join(__dirname, "public", "registro.html")));
app.get("/mapa", (req, res) => res.sendFile(path.join(__dirname, "public", "mapa.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
