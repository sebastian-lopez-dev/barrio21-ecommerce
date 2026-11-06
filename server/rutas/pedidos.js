// ==========================================
// RUTAS DE PEDIDOS
// ==========================================

const crypto = require("node:crypto");
const express = require("express");

const {
    validarCliente,
    validarProductos,
    calcularEnvio,
    redondear
} = require("../validacion");


class ErrorPedido extends Error {

    constructor(mensaje, estado = 400) {
        super(mensaje);
        this.estado = estado;
    }
}


function generarCodigoPedido() {

    // Código corto y difícil de adivinar, por ejemplo B21-7F3K9Q

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const bytes = crypto.randomBytes(6);

    let codigo = "";

    for (const byte of bytes) {
        codigo += caracteres[byte % caracteres.length];
    }

    return `B21-${codigo}`;
}


function crearRutasPedidos(db) {

    const rutas = express.Router();

    const buscarProducto =
        db.prepare("SELECT * FROM productos WHERE id = ?");

    const descontarStock = db.prepare(`
        UPDATE productos
        SET stock = stock - @cantidad
        WHERE id = @id AND stock >= @cantidad
    `);

    const insertarPedido = db.prepare(`
        INSERT INTO pedidos (
            codigo, fecha, estado, nombre, correo, celular, direccion,
            distrito, referencia, departamento, metodo_pago,
            subtotal, envio, total
        ) VALUES (
            @codigo, @fecha, @estado, @nombre, @correo, @celular, @direccion,
            @distrito, @referencia, @departamento, @metodoPago,
            @subtotal, @envio, @total
        )
    `);

    const insertarLinea = db.prepare(`
        INSERT INTO pedido_productos (
            pedido_id, producto_id, talla, cantidad, precio_unitario
        ) VALUES (?, ?, ?, ?, ?)
    `);

    const buscarPedido =
        db.prepare("SELECT * FROM pedidos WHERE codigo = ?");

    const lineasPedido = db.prepare(`
        SELECT pp.producto_id AS id, p.nombre, pp.talla,
               pp.cantidad, pp.precio_unitario AS precioUnitario
        FROM pedido_productos pp
        JOIN productos p ON p.id = pp.producto_id
        WHERE pp.pedido_id = ?
    `);


    /*
       Todo el pedido ocurre en una transacción:
       si un producto no tiene stock, no se guarda nada
       y no se descuenta stock de ningún otro producto.
    */

    const registrarPedido = db.transaction((cliente, productos) => {

        // Juntar las líneas por producto para revisar el stock total

        const unidadesPorProducto = new Map();

        for (const item of productos) {

            unidadesPorProducto.set(
                item.id,
                (unidadesPorProducto.get(item.id) || 0) +
                item.cantidad
            );
        }


        const lineas = productos.map((item) => {

            const producto = buscarProducto.get(item.id);

            if (!producto) {
                throw new ErrorPedido(
                    `El producto ${item.id} no existe`
                );
            }

            if (!JSON.parse(producto.tallas).includes(item.talla)) {
                throw new ErrorPedido(
                    `La talla ${item.talla} no existe para ${producto.nombre}`
                );
            }

            return { item, producto };
        });


        for (const [id, cantidad] of unidadesPorProducto) {

            const resultado =
                descontarStock.run({ id, cantidad });

            if (resultado.changes === 0) {

                const producto = buscarProducto.get(id);

                throw new ErrorPedido(
                    `Solo quedan ${producto.stock} unidades de ${producto.nombre}`,
                    409
                );
            }
        }


        const subtotal = redondear(
            lineas.reduce(
                (total, { item, producto }) =>
                    total + producto.precio * item.cantidad,
                0
            )
        );

        const envio = calcularEnvio(subtotal);
        const total = redondear(subtotal + envio);

        const pedido = {
            codigo: generarCodigoPedido(),
            fecha: new Date().toISOString(),
            estado: "CONFIRMADO",
            nombre: cliente.nombre.trim(),
            correo: cliente.correo.trim().toLowerCase(),
            celular: cliente.celular.trim(),
            direccion: cliente.direccion.trim(),
            distrito: cliente.distrito.trim(),
            referencia: cliente.referencia?.trim() || null,
            departamento: cliente.departamento,
            metodoPago: cliente.metodoPago,
            subtotal,
            envio,
            total
        };

        const { lastInsertRowid } =
            insertarPedido.run(pedido);

        for (const { item, producto } of lineas) {

            insertarLinea.run(
                lastInsertRowid,
                producto.id,
                item.talla,
                item.cantidad,
                producto.precio
            );
        }

        return pedido;
    });


    // POST /api/pedidos

    rutas.post("/", (req, res) => {

        const { cliente, productos } = req.body || {};

        const errores = [
            ...validarCliente(cliente),
            ...validarProductos(productos)
        ];

        if (errores.length > 0) {

            return res.status(400).json({
                error: errores[0],
                errores
            });
        }

        try {

            const pedido =
                registrarPedido(cliente, productos);

            res.status(201).json({
                codigo: pedido.codigo,
                fecha: pedido.fecha,
                estado: pedido.estado,
                subtotal: pedido.subtotal,
                envio: pedido.envio,
                total: pedido.total
            });

        } catch (error) {

            if (error instanceof ErrorPedido) {

                return res.status(error.estado).json({
                    error: error.message
                });
            }

            throw error;
        }
    });


    // GET /api/pedidos/:codigo

    rutas.get("/:codigo", (req, res) => {

        const pedido =
            buscarPedido.get(req.params.codigo);

        if (!pedido) {

            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        res.json({
            codigo: pedido.codigo,
            fecha: pedido.fecha,
            estado: pedido.estado,
            subtotal: pedido.subtotal,
            envio: pedido.envio,
            total: pedido.total,
            productos: lineasPedido.all(pedido.id)
        });
    });


    return rutas;
}


module.exports = { crearRutasPedidos };
