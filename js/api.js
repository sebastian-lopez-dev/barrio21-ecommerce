// ==========================================
// CONEXIÓN CON EL BACKEND DE BARRIO21
// ==========================================

/*
   Si la tienda se abre con el servidor (npm start), los precios,
   el stock y los pedidos vienen de la API.
   Si se abre sin servidor (GitHub Pages o Live Server), se usa el
   catálogo de js/productos.js y los pedidos se guardan en el navegador.
*/

const API_BASE = "/api";

let modoServidor = false;


class ErrorAPI extends Error {

    constructor(mensaje, estado) {
        super(mensaje);
        this.estado = estado;
    }
}


async function pedirAPI(ruta, opciones = {}) {

    const controlador = new AbortController();

    const temporizador =
        setTimeout(() => controlador.abort(), 8000);

    try {

        const respuesta = await fetch(
            `${API_BASE}${ruta}`,
            {
                ...opciones,
                headers: {
                    "Content-Type": "application/json",
                    ...opciones.headers
                },
                signal: controlador.signal
            }
        );

        const tipo =
            respuesta.headers.get("content-type") || "";

        // Sin servidor, /api devuelve una página HTML o un 404

        if (!tipo.includes("application/json")) {
            throw new ErrorAPI("API no disponible", 0);
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new ErrorAPI(
                datos.error || "No se pudo completar la operación",
                respuesta.status
            );
        }

        return datos;

    } catch (error) {

        if (error instanceof ErrorAPI) {
            throw error;
        }

        // Error de red o tiempo de espera agotado

        throw new ErrorAPI("API no disponible", 0);

    } finally {

        clearTimeout(temporizador);
    }
}


// Actualizar precios y stock con los datos del servidor

const catalogoListo = (async () => {

    try {

        const productosServidor =
            await pedirAPI("/productos");

        productosServidor.forEach((productoServidor) => {

            const producto =
                productos.find(
                    (item) => item.id === productoServidor.id
                );

            if (producto) {
                producto.precio = productoServidor.precio;
                producto.precioAnterior = productoServidor.precioAnterior;
                producto.stock = productoServidor.stock;
            }
        });

        modoServidor = true;

        document.dispatchEvent(
            new CustomEvent("catalogo-actualizado")
        );

    } catch (error) {

        modoServidor = false;
    }
})();


// Enviar un pedido: el servidor revisa el stock y calcula el total

function enviarPedidoAPI(cliente, carrito) {

    return pedirAPI("/pedidos", {
        method: "POST",
        body: JSON.stringify({
            cliente,
            productos: carrito.map((item) => ({
                id: item.id,
                talla: item.talla,
                cantidad: item.cantidad
            }))
        })
    });
}
