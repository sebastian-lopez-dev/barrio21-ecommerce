const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..");
fs.mkdirSync(path.join(raiz, "datos"), { recursive: true });
const db = new DatabaseSync(path.join(raiz, "datos", "barrio21.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL,
        tallas TEXT NOT NULL
    )
`);

// Llenar la tabla la primera vez con js/productos.js
const { total } = db.prepare("SELECT COUNT(*) AS total FROM productos").get();

if (total === 0) {
    const codigo = fs.readFileSync(path.join(raiz, "js", "productos.js"), "utf-8");
    const contexto = {};
    vm.runInNewContext(codigo + "\nthis.productos = productos;", contexto);

    const insertar = db.prepare(
        "INSERT INTO productos (id, nombre, categoria, precio, stock, tallas) VALUES (?, ?, ?, ?, ?, ?)"
    );

    contexto.productos.forEach((p) => {
        insertar.run(p.id, p.nombre, p.categoria, p.precio, p.stock, JSON.stringify(p.tallas));
    });
}

module.exports = db;