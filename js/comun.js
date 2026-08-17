// ==========================================
// FUNCIONES COMPARTIDAS DE BARRIO21
// ==========================================


// Formatear precios en soles

function formatearPrecio(precio) {

    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN"
    }).format(precio);
}


// Leer información de localStorage de forma segura

function leerLocalStorage(
    clave,
    valorPredeterminado = []
) {

    try {

        const contenido =
            localStorage.getItem(clave);

        if (contenido === null) {
            return valorPredeterminado;
        }

        const resultado =
            JSON.parse(contenido);

        return resultado ?? valorPredeterminado;

    } catch (error) {

        console.error(
            `No se pudo leer ${clave}:`,
            error
        );

        return valorPredeterminado;
    }
}


// Guardar información en localStorage

function guardarLocalStorage(clave, valor) {

    try {

        localStorage.setItem(
            clave,
            JSON.stringify(valor)
        );

        return true;

    } catch (error) {

        console.error(
            `No se pudo guardar ${clave}:`,
            error
        );

        return false;
    }
}


// Calcular todas las unidades del carrito

function obtenerCantidadTotalCarrito(carrito) {

    return carrito.reduce(
        (total, item) =>
            total + Number(item.cantidad || 0),
        0
    );
}


// Colocar el año automáticamente

function colocarAnioActual(selector) {

    const elemento =
        document.querySelector(selector);

    if (elemento) {

        elemento.textContent =
            new Date().getFullYear();
    }
}