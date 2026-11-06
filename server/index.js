// ==========================================
// INICIAR EL SERVIDOR
// ==========================================

const path = require("node:path");

const { abrirBaseDeDatos } = require("./db");
const { crearApp } = require("./app");

const PUERTO = Number(process.env.PORT) || 3000;

const RUTA_BASE_DATOS =
    process.env.DB_PATH ||
    path.join(__dirname, "..", "datos", "barrio21.db");


require("node:fs").mkdirSync(
    path.dirname(RUTA_BASE_DATOS),
    { recursive: true }
);


const db = abrirBaseDeDatos(RUTA_BASE_DATOS);
const app = crearApp(db);

app.listen(PUERTO, () => {
    console.log(`BARRIO21 funcionando en http://localhost:${PUERTO}`);
});
