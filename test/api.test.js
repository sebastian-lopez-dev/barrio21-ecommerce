// Pruebas de la API. Ejecutar con: npm test

const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const { abrirBaseDeDatos } = require("../server/db");
const { crearApp } = require("../server/app");

let servidor;
let url;
let db;

const clienteValido = {
    nombre: "Sebastian Lopez",
    correo: "cliente@ejemplo.com",
    celular: "987654321",
    direccion: "Av. Siempre Viva 123",
    distrito: "Miraflores",
    referencia: "",
    departamento: "Lima",
    metodoPago: "Yape o Plin"
};


beforeEach(async () => {

    // Cada prueba usa una base de datos nueva en memoria

    db = abrirBaseDeDatos(":memory:");

    await new Promise((resolver) => {
        servidor = crearApp(db).listen(0, resolver);
    });

    url = `http://localhost:${servidor.address().port}`;
});


afterEach(() => {
    servidor.close();
    db.close();
});


function crearPedido(cuerpo) {

    return fetch(`${url}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo)
    });
}


function stockDe(id) {
    return db.prepare("SELECT stock FROM productos WHERE id = ?").get(id).stock;
}


test("lista los 24 productos del catálogo", async () => {

    const respuesta = await fetch(`${url}/api/productos`);
    const productos = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(productos.length, 24);
    assert.deepEqual(productos[0].tallas, ["S", "M", "L", "XL"]);
});


test("devuelve 404 si el producto no existe", async () => {

    const respuesta = await fetch(`${url}/api/productos/999`);

    assert.equal(respuesta.status, 404);
});


test("crea un pedido, calcula el total y descuenta el stock", async () => {

    const stockInicial = stockDe(2);

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [{ id: 2, talla: "M", cantidad: 2 }]
    });

    const pedido = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.match(pedido.codigo, /^B21-[A-Z0-9]{6}$/);
    assert.equal(pedido.subtotal, 159.8);
    assert.equal(pedido.envio, 10);
    assert.equal(pedido.total, 169.8);
    assert.equal(stockDe(2), stockInicial - 2);


    const consulta = await fetch(`${url}/api/pedidos/${pedido.codigo}`);
    const guardado = await consulta.json();

    assert.equal(guardado.total, 169.8);
    assert.equal(guardado.productos.length, 1);
});


test("ignora precios enviados por el navegador", async () => {

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [{ id: 1, talla: "M", cantidad: 1, precio: 0.01 }],
        total: 0.01
    });

    const pedido = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.equal(pedido.subtotal, 149.9);
});


test("envío gratis desde S/ 199", async () => {

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [{ id: 1, talla: "M", cantidad: 2 }]
    });

    const pedido = await respuesta.json();

    assert.equal(pedido.envio, 0);
});


test("rechaza el pedido si no alcanza el stock entre tallas", async () => {

    const stock = stockDe(1);

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [
            { id: 1, talla: "S", cantidad: stock },
            { id: 1, talla: "M", cantidad: 1 }
        ]
    });

    assert.equal(respuesta.status, 409);
    assert.equal(stockDe(1), stock);
});


test("no descuenta nada si un producto del pedido falla", async () => {

    const stockProducto2 = stockDe(2);

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [
            { id: 2, talla: "M", cantidad: 1 },
            { id: 1, talla: "M", cantidad: 9999 }
        ]
    });

    assert.equal(respuesta.status, 409);
    assert.equal(stockDe(2), stockProducto2);
});


test("rechaza tallas que no existen", async () => {

    const respuesta = await crearPedido({
        cliente: clienteValido,
        productos: [{ id: 1, talla: "XXXL", cantidad: 1 }]
    });

    assert.equal(respuesta.status, 400);
});


test("valida los datos del cliente", async () => {

    const respuesta = await crearPedido({
        cliente: { ...clienteValido, celular: "123", correo: "no-es-correo" },
        productos: [{ id: 1, talla: "M", cantidad: 1 }]
    });

    const datos = await respuesta.json();

    assert.equal(respuesta.status, 400);
    assert.ok(datos.errores.length >= 2);
});


test("contraentrega solo en Lima", async () => {

    const respuesta = await crearPedido({
        cliente: {
            ...clienteValido,
            departamento: "Cusco",
            metodoPago: "Contraentrega"
        },
        productos: [{ id: 1, talla: "M", cantidad: 1 }]
    });

    assert.equal(respuesta.status, 400);
});


test("rechaza cantidades inválidas", async () => {

    for (const cantidad of [0, -1, 1.5, "2"]) {

        const respuesta = await crearPedido({
            cliente: clienteValido,
            productos: [{ id: 1, talla: "M", cantidad }]
        });

        assert.equal(respuesta.status, 400, `cantidad ${cantidad}`);
    }
});


test("responde 400 con JSON inválido", async () => {

    const respuesta = await fetch(`${url}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ esto no es json"
    });

    assert.equal(respuesta.status, 400);
});


test("no expone archivos internos del proyecto", async () => {

    for (const ruta of ["/package.json", "/server/db.js", "/datos/barrio21.db"]) {

        const respuesta = await fetch(`${url}${ruta}`);

        assert.equal(respuesta.status, 404, ruta);
    }
});
