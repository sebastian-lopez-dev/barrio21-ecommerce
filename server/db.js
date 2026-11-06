// ==========================================
// BASE DE DATOS (SQLite)
// ==========================================

const Database = require("better-sqlite3");
const { leerCatalogoInicial } = require("./catalogo");


function crearTablas(db) {

    db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id              INTEGER PRIMARY KEY,
            sku             TEXT    NOT NULL UNIQUE,
            nombre          TEXT    NOT NULL,
            categoria       TEXT    NOT NULL,
            tipo            TEXT    NOT NULL,
            color           TEXT    NOT NULL,
            precio          REAL    NOT NULL CHECK (precio >= 0),
            precio_anterior REAL,
            etiqueta        TEXT,
            stock           INTEGER NOT NULL CHECK (stock >= 0),
            tallas          TEXT    NOT NULL,
            descripcion     TEXT    NOT NULL,
            imagen          TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pedidos (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo       TEXT    NOT NULL UNIQUE,
            fecha        TEXT    NOT NULL,
            estado       TEXT    NOT NULL,
            nombre       TEXT    NOT NULL,
            correo       TEXT    NOT NULL,
            celular      TEXT    NOT NULL,
            direccion    TEXT    NOT NULL,
            distrito     TEXT    NOT NULL,
            referencia   TEXT,
            departamento TEXT    NOT NULL,
            metodo_pago  TEXT    NOT NULL,
            subtotal     REAL    NOT NULL,
            envio        REAL    NOT NULL,
            total        REAL    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pedido_productos (
            pedido_id       INTEGER NOT NULL REFERENCES pedidos(id),
            producto_id     INTEGER NOT NULL REFERENCES productos(id),
            talla           TEXT    NOT NULL,
            cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
            precio_unitario REAL    NOT NULL
        );
    `);
}


// Llenar los productos solo si la tabla está vacía

function cargarProductosIniciales(db) {

    const { total } =
        db.prepare("SELECT COUNT(*) AS total FROM productos").get();

    if (total > 0) {
        return;
    }

    const insertar = db.prepare(`
        INSERT INTO productos (
            id, sku, nombre, categoria, tipo, color, precio,
            precio_anterior, etiqueta, stock, tallas, descripcion, imagen
        ) VALUES (
            @id, @sku, @nombre, @categoria, @tipo, @color, @precio,
            @precioAnterior, @etiqueta, @stock, @tallas, @descripcion, @imagen
        )
    `);

    const insertarTodos = db.transaction((productos) => {

        for (const producto of productos) {

            insertar.run({
                ...producto,
                precioAnterior: producto.precioAnterior ?? null,
                etiqueta: producto.etiqueta ?? null,
                tallas: JSON.stringify(producto.tallas)
            });
        }
    });

    insertarTodos(leerCatalogoInicial());
}


function abrirBaseDeDatos(ruta) {

    const db = new Database(ruta);

    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    crearTablas(db);
    cargarProductosIniciales(db);

    return db;
}


module.exports = { abrirBaseDeDatos };
