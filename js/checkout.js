// ==========================================
// CHECKOUT DE BARRIO21
// ==========================================

let carrito =
    leerLocalStorage(
        "barrio21_carrito",
        []
    );

let totalesCheckout = {
    subtotal: 0,
    envio: 0,
    total: 0
};




// ==========================================
// VALIDAR EL CARRITO
// ==========================================

function limpiarProductosInvalidos() {

    carrito = carrito.filter((item) => {

        const productoExiste =
            productos.some(
                (producto) =>
                    producto.id === item.id
            );

        return (
            productoExiste &&
            item.cantidad > 0
        );
    });


    guardarLocalStorage(
        "barrio21_carrito",
        carrito
    );
}


// ==========================================
// CALCULAR TOTALES
// ==========================================

function calcularTotales() {

    const subtotal =
        carrito.reduce((total, item) => {

            const producto =
                productos.find(
                    (producto) =>
                        producto.id === item.id
                );

            if (!producto) {
                return total;
            }

            return total +
                producto.precio *
                item.cantidad;

        }, 0);


    // Envío gratis desde S/199

    const envio =
        subtotal >= 199 ? 0 : 10;

    const total =
        subtotal + envio;


    totalesCheckout = {
        subtotal,
        envio,
        total
    };


    return totalesCheckout;
}


// ==========================================
// MOSTRAR RESUMEN
// ==========================================

function renderizarCheckout() {

    const proceso =
        document.querySelector(
            "#checkoutProceso"
        );

    const carritoVacio =
        document.querySelector(
            "#checkoutVacio"
        );

    const confirmacion =
        document.querySelector(
            "#checkoutConfirmacion"
        );


    if (carrito.length === 0) {

        proceso.classList.add("oculto");
        confirmacion.classList.add("oculto");
        carritoVacio.classList.remove("oculto");

        return;
    }


    carritoVacio.classList.add("oculto");
    confirmacion.classList.add("oculto");
    proceso.classList.remove("oculto");


    const contenedor =
        document.querySelector(
            "#checkoutListaProductos"
        );

    const cantidadTotal =
        obtenerCantidadTotalCarrito(carrito);


    document.querySelector(
        "#cantidadResumen"
    ).textContent = `(${cantidadTotal})`;


    contenedor.innerHTML =
        carrito.map((item) => {

            const producto =
                productos.find(
                    (producto) =>
                        producto.id === item.id
                );

            if (!producto) {
                return "";
            }


            const precioTotal =
                producto.precio *
                item.cantidad;


            return `
                <article class="pago-producto">

                    <a href="producto.html?id=${producto.id}">

                        <img
                            src="${producto.imagen}"
                            alt="${producto.nombre}"
                        >

                    </a>

                    <div class="pago-producto-info">

                        <h3>
                            <a href="producto.html?id=${producto.id}">
                                ${producto.nombre}
                            </a>
                        </h3>

                        <p>
                            Talla: ${item.talla}
                        </p>

                        <p>
                            Cantidad: ${item.cantidad}
                        </p>

                    </div>

                    <strong class="pago-producto-precio">
                        ${formatearPrecio(precioTotal)}
                    </strong>

                </article>
            `;

        }).join("");


    const totales =
        calcularTotales();


    document.querySelector(
        "#checkoutSubtotal"
    ).textContent =
        formatearPrecio(totales.subtotal);


    document.querySelector(
        "#checkoutEnvio"
    ).textContent =
        totales.envio === 0
            ? "GRATIS"
            : formatearPrecio(totales.envio);


    document.querySelector(
        "#checkoutTotal"
    ).textContent =
        formatearPrecio(totales.total);
}


// ==========================================
// GUARDAR DATOS DEL CLIENTE
// ==========================================

function guardarDatosCliente(datos) {

    const datosRecordados = {
        nombre: datos.nombre,
        correo: datos.correo,
        celular: datos.celular,
        direccion: datos.direccion,
        distrito: datos.distrito,
        referencia: datos.referencia,
        departamento: datos.departamento
    };


    guardarLocalStorage(
        "barrio21_datos_cliente",
        datosRecordados
    );
}


function cargarDatosCliente() {

    const datos =
        leerLocalStorage(
            "barrio21_datos_cliente",
            null
        );


    if (!datos) {
        return;
    }


    const campos = {
        pagoNombre: datos.nombre,
        pagoCorreo: datos.correo,
        pagoCelular: datos.celular,
        pagoDireccion: datos.direccion,
        pagoDistrito: datos.distrito,
        pagoReferencia: datos.referencia,
        pagoDepartamento: datos.departamento
    };


    Object.entries(campos).forEach(
        ([idCampo, valor]) => {

            const campo =
                document.querySelector(
                    `#${idCampo}`
                );

            if (campo && valor) {
                campo.value = valor;
            }
        }
    );
}


// ==========================================
// GENERAR CÓDIGO DEL PEDIDO
// ==========================================

function generarCodigoPedido() {

    const parteFecha =
        Date.now()
            .toString()
            .slice(-7);

    return `B21-${parteFecha}`;
}


// ==========================================
// GUARDAR PEDIDO
// ==========================================

function guardarPedido(datosCliente) {

    const codigo =
        generarCodigoPedido();


    const productosPedido =
        carrito.map((item) => {

            const producto =
                productos.find(
                    (producto) =>
                        producto.id === item.id
                );

            return {
                id: item.id,
                sku: producto?.sku || "",
                nombre: producto?.nombre || "",
                talla: item.talla,
                cantidad: item.cantidad,
                precioUnitario:
                    producto?.precio || 0
            };
        });


    const pedido = {
        codigo: codigo,
        fecha: new Date().toISOString(),
        estado: "CONFIRMADO",
        cliente: datosCliente,
        productos: productosPedido,
        subtotal: totalesCheckout.subtotal,
        envio: totalesCheckout.envio,
        total: totalesCheckout.total
    };


    const pedidos =
        leerLocalStorage(
            "barrio21_pedidos",
            []
        );


    pedidos.push(pedido);


    guardarLocalStorage(
        "barrio21_pedidos",
        pedidos
    );

    return pedido;
}


// ==========================================
// MOSTRAR CONFIRMACIÓN
// ==========================================

function mostrarConfirmacion(pedido) {

    document.querySelector(
        "#checkoutProceso"
    ).classList.add("oculto");


    document.querySelector(
        "#checkoutVacio"
    ).classList.add("oculto");


    document.querySelector(
        "#checkoutConfirmacion"
    ).classList.remove("oculto");


    document.querySelector(
        "#codigoPedidoConfirmado"
    ).textContent = pedido.codigo;


    document.querySelector(
        "#totalPedidoConfirmado"
    ).textContent =
        formatearPrecio(pedido.total);


    const pasos =
        document.querySelectorAll(
            ".pago-progreso > div"
        );


    pasos.forEach((paso) => {

        paso.classList.remove("activo");
        paso.classList.add("completado");
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// NOTIFICACIÓN DE ERROR
// ==========================================

function mostrarAvisoCheckout(
    titulo,
    detalle
) {

    const aviso =
        document.createElement("div");

    aviso.className =
        "notificacion-carrito";

    aviso.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <div>
            <strong>${titulo}</strong>
            <span>${detalle}</span>
        </div>
    `;


    document.body.appendChild(aviso);


    requestAnimationFrame(() => {
        aviso.classList.add("visible");
    });


    setTimeout(() => {

        aviso.classList.remove("visible");

        setTimeout(() => {
            aviso.remove();
        }, 300);

    }, 3500);
}


// ==========================================
// PROCESAR EL FORMULARIO
// ==========================================

function procesarPedido(evento) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    if (!formulario.checkValidity()) {

        formulario.reportValidity();
        return;
    }


    if (carrito.length === 0) {

        renderizarCheckout();
        return;
    }


    const datosCliente =
        Object.fromEntries(
            new FormData(formulario)
        );


    // Contraentrega únicamente en Lima

    if (
        datosCliente.metodoPago ===
        "Contraentrega" &&
        datosCliente.departamento !== "Lima"
    ) {

        mostrarAvisoCheckout(
            "CONTRAENTREGA NO DISPONIBLE",
            "Selecciona Yape, Plin o tarjeta para envíos fuera de Lima."
        );

        return;
    }


    calcularTotales();
    guardarDatosCliente(datosCliente);


    const pedido =
        guardarPedido(datosCliente);


    // Vaciar el carrito después de confirmar

    carrito = [];


    guardarLocalStorage(
        "barrio21_carrito",
        carrito
    );


    mostrarConfirmacion(pedido);
}


// ==========================================
// INICIAR CHECKOUT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    colocarAnioActual("#anioCheckout");


    limpiarProductosInvalidos();
    cargarDatosCliente();
    renderizarCheckout();


    document.querySelector(
        "#formCheckoutPagina"
    ).addEventListener(
        "submit",
        procesarPedido
    );
});