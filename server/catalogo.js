// ==========================================
// CATÁLOGO INICIAL
// ==========================================

/*
   El catálogo vive en js/productos.js para que la tienda
   también funcione sin servidor (por ejemplo en GitHub Pages).
   Aquí leemos ese mismo archivo para llenar la base de datos
   la primera vez, así no hay dos listas de productos distintas.
*/

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const RUTA_CATALOGO =
    path.join(__dirname, "..", "js", "productos.js");


function leerCatalogoInicial() {

    const codigo =
        fs.readFileSync(RUTA_CATALOGO, "utf-8");

    const contexto = {};

    vm.runInNewContext(
        `${codigo}\nthis.productos = productos;`,
        contexto
    );

    return contexto.productos;
}


module.exports = { leerCatalogoInicial };
