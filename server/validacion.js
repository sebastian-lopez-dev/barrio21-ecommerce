// ==========================================
// VALIDACIÓN DE PEDIDOS
// ==========================================

/*
   Nunca confiamos en lo que manda el navegador:
   el cliente solo envía qué productos quiere y sus datos.
   Precios, stock y totales se calculan en el servidor.
*/

const DEPARTAMENTOS = [
    "Lima",
    "Arequipa",
    "Cusco",
    "La Libertad",
    "Piura",
    "Otro"
];

const METODOS_PAGO = [
    "Yape o Plin",
    "Tarjeta",
    "Contraentrega"
];

const MAXIMO_LINEAS = 50;


function textoValido(valor, maximo) {

    return (
        typeof valor === "string" &&
        valor.trim().length > 0 &&
        valor.trim().length <= maximo
    );
}


function validarCliente(cliente) {

    const errores = [];

    if (!cliente || typeof cliente !== "object") {
        return ["Faltan los datos del cliente"];
    }

    if (!textoValido(cliente.nombre, 100)) {
        errores.push("El nombre es obligatorio");
    }

    if (
        !textoValido(cliente.correo, 120) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo.trim())
    ) {
        errores.push("El correo no es válido");
    }

    if (
        typeof cliente.celular !== "string" ||
        !/^[0-9]{9}$/.test(cliente.celular.trim())
    ) {
        errores.push("El celular debe tener 9 dígitos");
    }

    if (!textoValido(cliente.direccion, 200)) {
        errores.push("La dirección es obligatoria");
    }

    if (!textoValido(cliente.distrito, 100)) {
        errores.push("El distrito es obligatorio");
    }

    if (
        cliente.referencia !== undefined &&
        cliente.referencia !== "" &&
        !textoValido(cliente.referencia, 200)
    ) {
        errores.push("La referencia es demasiado larga");
    }

    if (!DEPARTAMENTOS.includes(cliente.departamento)) {
        errores.push("El departamento no es válido");
    }

    if (!METODOS_PAGO.includes(cliente.metodoPago)) {
        errores.push("El método de pago no es válido");
    }

    if (
        cliente.metodoPago === "Contraentrega" &&
        cliente.departamento !== "Lima"
    ) {
        errores.push("La contraentrega solo está disponible en Lima");
    }

    return errores;
}


function validarProductos(productos) {

    if (
        !Array.isArray(productos) ||
        productos.length === 0
    ) {
        return ["El carrito está vacío"];
    }

    if (productos.length > MAXIMO_LINEAS) {
        return ["El pedido tiene demasiados productos"];
    }

    const valido = productos.every((item) =>
        item &&
        Number.isInteger(item.id) &&
        typeof item.talla === "string" &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );

    return valido
        ? []
        : ["Hay productos con datos inválidos"];
}


// Mismas reglas de envío que muestra el checkout

function calcularEnvio(subtotal) {
    return subtotal >= 199 ? 0 : 10;
}


function redondear(monto) {
    return Math.round(monto * 100) / 100;
}


module.exports = {
    validarCliente,
    validarProductos,
    calcularEnvio,
    redondear
};
