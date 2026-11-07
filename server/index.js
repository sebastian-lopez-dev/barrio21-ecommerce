const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const raiz = path.join(__dirname, "..");

app.get("/api/salud", (req, res) => {
    res.json({ estado: "ok" });
});

app.get("/api/productos", (req, res) => {
    const filas = db.prepare("SELECT * FROM productos").all();
    res.json(filas.map((f) => ({ ...f, tallas: JSON.parse(f.tallas) })));
});

// Carpetas públicas
app.use("/css", express.static(path.join(raiz, "css")));
app.use("/js", express.static(path.join(raiz, "js")));
app.use("/img", express.static(path.join(raiz, "img")));

// Páginas de la tienda
const paginas = ["index.html", "tienda.html", "producto.html", "checkout.html", "favicon.svg"];

paginas.forEach((pagina) => {
    app.get("/" + pagina, (req, res) => {
        res.sendFile(path.join(raiz, pagina));
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(raiz, "index.html"));
});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});