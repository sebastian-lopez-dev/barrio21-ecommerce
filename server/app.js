// ==========================================
// APLICACIÓN EXPRESS
// ==========================================

const path = require("node:path");
const express = require("express");

const { crearRutasProductos } = require("./rutas/productos");
const { crearRutasPedidos } = require("./rutas/pedidos");

const CARPETA_FRONTEND = path.join(__dirname, "..");

// Solo estos archivos y carpetas del proyecto se sirven al navegador

const ARCHIVOS_PUBLICOS = [
    "index.html",
    "tienda.html",
    "producto.html",
    "checkout.html",
    "favicon.svg"
];

const CARPETAS_PUBLICAS = ["css", "js", "img"];


function crearApp(db) {

    const app = express();

    app.disable("x-powered-by");
    app.use(express.json({ limit: "20kb" }));


    // API

    app.get("/api/salud", (req, res) => {
        res.json({ estado: "ok" });
    });

    app.use("/api/productos", crearRutasProductos(db));
    app.use("/api/pedidos", crearRutasPedidos(db));

    app.use("/api", (req, res) => {
        res.status(404).json({ error: "Ruta no encontrada" });
    });


    // Frontend

    for (const carpeta of CARPETAS_PUBLICAS) {

        app.use(
            `/${carpeta}`,
            express.static(path.join(CARPETA_FRONTEND, carpeta))
        );
    }

    for (const archivo of ARCHIVOS_PUBLICOS) {

        app.get(`/${archivo}`, (req, res) => {
            res.sendFile(path.join(CARPETA_FRONTEND, archivo));
        });
    }

    app.get("/", (req, res) => {
        res.sendFile(path.join(CARPETA_FRONTEND, "index.html"));
    });


    // Errores inesperados: no mostramos detalles internos

    app.use((error, req, res, next) => {

        if (error.type === "entity.parse.failed") {

            return res.status(400).json({
                error: "El cuerpo de la petición no es JSON válido"
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Error interno del servidor"
        });
    });


    return app;
}


module.exports = { crearApp };
