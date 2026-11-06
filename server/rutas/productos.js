// ==========================================
// RUTAS DE PRODUCTOS
// ==========================================

const express = require("express");


// Convierte una fila de la base de datos al formato del frontend

function filaAProducto(fila) {

    return {
        id: fila.id,
        sku: fila.sku,
        nombre: fila.nombre,
        categoria: fila.categoria,
        tipo: fila.tipo,
        color: fila.color,
        precio: fila.precio,
        precioAnterior: fila.precio_anterior,
        etiqueta: fila.etiqueta,
        stock: fila.stock,
        tallas: JSON.parse(fila.tallas),
        descripcion: fila.descripcion,
        imagen: fila.imagen
    };
}


function crearRutasProductos(db) {

    const rutas = express.Router();

    const listar =
        db.prepare("SELECT * FROM productos ORDER BY id");

    const buscar =
        db.prepare("SELECT * FROM productos WHERE id = ?");


    // GET /api/productos

    rutas.get("/", (req, res) => {

        res.json(
            listar.all().map(filaAProducto)
        );
    });


    // GET /api/productos/:id

    rutas.get("/:id", (req, res) => {

        const fila =
            buscar.get(Number(req.params.id));

        if (!fila) {

            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json(filaAProducto(fila));
    });


    return rutas;
}


module.exports = { crearRutasProductos, filaAProducto };
