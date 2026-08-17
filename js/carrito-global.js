// ==========================================
// CARRITO LATERAL COMPARTIDO
// ==========================================

let carritoGlobal = [];


function cargarCarritoGlobal() {

    carritoGlobal =
        leerLocalStorage(
            "barrio21_carrito",
            []
        );
}


function guardarCarritoGlobal() {

    guardarLocalStorage(
        "barrio21_carrito",
        carritoGlobal
    );
}


function actualizarContadoresGlobales() {

    const cantidad =
        obtenerCantidadTotalCarrito(
            carritoGlobal
        );

    const contadores =
        document.querySelectorAll(`
            #contadorCarrito,
            #contadorCarritoTienda,
            #contadorCarritoProducto
        `);

    contadores.forEach((contador) => {
        contador.textContent = cantidad;
    });
}


// ==========================================
// CREAR EL PANEL
// ==========================================

function crearCarritoGlobal() {

    const contenedor =
        document.createElement("div");

    contenedor.innerHTML = `
        <div
            class="carrito-fondo"
            id="carritoFondoGlobal"
        ></div>

        <aside
            class="carrito-panel"
            id="carritoPanelGlobal"
            aria-hidden="true"
        >

            <header class="carrito-header">

                <div>
                    <p>MI COMPRA</p>

                    <h2>
                        CARRITO
                        <span id="cantidadCarritoGlobal">
                            (0)
                        </span>
                    </h2>
                </div>

                <button
                    class="carrito-cerrar"
                    id="cerrarCarritoGlobal"
                    aria-label="Cerrar carrito"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </header>

            <div
                class="carrito-contenido"
                id="contenidoCarritoGlobal"
            ></div>

            <footer
                class="carrito-resumen oculto"
                id="resumenCarritoGlobal"
            >

                <div class="carrito-subtotal">

                    <span>SUBTOTAL</span>

                    <strong id="subtotalCarritoGlobal">
                        S/ 0.00
                    </strong>

                </div>

                <p>
                    El costo de envío se calculará al finalizar
                    la compra.
                </p>

                <button
                    class="carrito-finalizar"
                    id="finalizarCarritoGlobal"
                >
                    FINALIZAR COMPRA

                    <i class="fa-solid fa-arrow-right"></i>
                </button>

                <button
                    class="carrito-seguir"
                    id="seguirComprandoGlobal"
                >
                    SEGUIR COMPRANDO
                </button>

            </footer>

        </aside>
    `;

    document.body.appendChild(contenedor);
}


// ==========================================
// MOSTRAR PRODUCTOS DEL CARRITO
// ==========================================

function renderizarCarritoGlobal() {

    const contenido =
        document.querySelector(
            "#contenidoCarritoGlobal"
        );

    const resumen =
        document.querySelector(
            "#resumenCarritoGlobal"
        );

    const cantidadTexto =
        document.querySelector(
            "#cantidadCarritoGlobal"
        );

    const subtotalElemento =
        document.querySelector(
            "#subtotalCarritoGlobal"
        );


    const cantidad =
        obtenerCantidadTotalCarrito(
            carritoGlobal
        );

    cantidadTexto.textContent =
        `(${cantidad})`;


    if (carritoGlobal.length === 0) {

        contenido.innerHTML = `
            <div class="carrito-vacio">

                <i class="fa-solid fa-bag-shopping"></i>

                <h3>TU CARRITO ESTÁ VACÍO</h3>

                <p>
                    Explora la colección y encuentra
                    tu próximo estilo.
                </p>

            </div>
        `;

        resumen.classList.add("oculto");
        actualizarContadoresGlobales();

        return;
    }


    let subtotal = 0;


    contenido.innerHTML =
        carritoGlobal.map((item) => {

            const producto =
                productos.find(
                    (producto) =>
                        producto.id === item.id
                );

            if (!producto) {
                return "";
            }


            const totalProducto =
                producto.precio *
                item.cantidad;

            subtotal += totalProducto;


            return `
                <article
                    class="carrito-item"
                    data-id="${item.id}"
                    data-talla="${item.talla}"
                >

                    <div class="carrito-item-imagen">

                        <img
                            src="${producto.imagen}"
                            alt="${producto.nombre}"
                        >

                    </div>

                    <div class="carrito-item-info">

                        <div class="carrito-item-superior">

                            <div>

                                <p class="carrito-item-categoria">
                                    ${producto.categoria}
                                </p>

                                <h3 class="carrito-item-nombre">
                                    ${producto.nombre}
                                </h3>

                            </div>

                            <button
                                class="carrito-eliminar"
                                data-accion="eliminar"
                                aria-label="Eliminar producto"
                            >
                                <i class="fa-regular fa-trash-can"></i>
                            </button>

                        </div>

                        <p class="carrito-item-talla">
                            Talla: ${item.talla}
                        </p>

                        <div class="carrito-item-inferior">

                            <div class="carrito-cantidad">

                                <button
                                    data-accion="disminuir"
                                    aria-label="Disminuir"
                                >
                                    −
                                </button>

                                <span>${item.cantidad}</span>

                                <button
                                    data-accion="aumentar"
                                    aria-label="Aumentar"
                                >
                                    +
                                </button>

                            </div>

                            <strong class="carrito-item-total">
                                ${formatearPrecio(totalProducto)}
                            </strong>

                        </div>

                    </div>

                </article>
            `;

        }).join("");


    subtotalElemento.textContent =
        formatearPrecio(subtotal);

    resumen.classList.remove("oculto");

    actualizarContadoresGlobales();
}
function ajustarCarritoGlobalAlViewport() {

    const panel =
        document.querySelector(
            "#carritoPanelGlobal"
        );

    const vista =
        window.visualViewport;

    if (!panel || !vista) {
        return;
    }

    if (vista.width <= 500) {

        panel.style.setProperty(
            "width",
            `${vista.width}px`,
            "important"
        );

        panel.style.setProperty(
            "max-width",
            `${vista.width}px`,
            "important"
        );

        panel.style.setProperty(
            "left",
            `${vista.offsetLeft}px`,
            "important"
        );

        panel.style.setProperty(
            "right",
            "auto",
            "important"
        );

        panel.style.setProperty(
            "height",
            `${vista.height}px`,
            "important"
        );
    }
}

// ==========================================
// ABRIR Y CERRAR
// ==========================================

function abrirCarritoGlobal() {

    cargarCarritoGlobal();
    renderizarCarritoGlobal();
    ajustarCarritoGlobalAlViewport();

    const panel =
        document.querySelector(
            "#carritoPanelGlobal"
        );

    panel.classList.add("visible");

    panel.setAttribute(
        "aria-hidden",
        "false"
    );

    panel.style.setProperty(
        "transform",
        "translateX(0)",
        "important"
    );

    document.querySelector(
        "#carritoFondoGlobal"
    ).classList.add("visible");

    document.body.classList.add(
        "carrito-abierto"
    );
}


function cerrarCarritoGlobal() {

    const panel =
        document.querySelector(
            "#carritoPanelGlobal"
        );

    if (panel.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    panel.classList.remove("visible");

    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    panel.style.setProperty(
        "transform",
        "translateX(105%)",
        "important"
    );

    document.querySelector(
        "#carritoFondoGlobal"
    ).classList.remove("visible");

    document.body.classList.remove(
        "carrito-abierto"
    );
}


// ==========================================
// CAMBIAR CANTIDADES
// ==========================================

function ejecutarAccionCarritoGlobal(
    accion,
    idProducto,
    talla
) {

    const item =
        carritoGlobal.find((item) =>
            item.id === idProducto &&
            item.talla === talla
        );

    if (!item) {
        return;
    }


    if (accion === "aumentar") {

        const producto =
            productos.find(
                (producto) =>
                    producto.id === idProducto
            );

        if (
            producto &&
            item.cantidad < producto.stock
        ) {
            item.cantidad += 1;
        }

    } else if (
        accion === "disminuir" &&
        item.cantidad > 1
    ) {

        item.cantidad -= 1;

    } else if (accion === "eliminar") {

        carritoGlobal =
            carritoGlobal.filter((item) =>
                !(
                    item.id === idProducto &&
                    item.talla === talla
                )
            );
    }


    guardarCarritoGlobal();
    renderizarCarritoGlobal();
}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    crearCarritoGlobal();
    cargarCarritoGlobal();
    actualizarContadoresGlobales();


    const botonAbrir =
        document.querySelector(
            "#botonCarritoTienda"
        ) ||
        document.querySelector(
            "#botonCarritoProducto"
        );


    if (botonAbrir) {

        botonAbrir.addEventListener(
            "click",
            abrirCarritoGlobal
        );
    }


    document.querySelector(
        "#cerrarCarritoGlobal"
    ).addEventListener(
        "click",
        cerrarCarritoGlobal
    );


    document.querySelector(
        "#carritoFondoGlobal"
    ).addEventListener(
        "click",
        cerrarCarritoGlobal
    );


    document.querySelector(
        "#seguirComprandoGlobal"
    ).addEventListener(
        "click",
        cerrarCarritoGlobal
    );


    document.querySelector(
        "#contenidoCarritoGlobal"
    ).addEventListener("click", (evento) => {

        const boton =
            evento.target.closest(
                "[data-accion]"
            );

        if (!boton) {
            return;
        }


        const elemento =
            boton.closest(".carrito-item");

        ejecutarAccionCarritoGlobal(
            boton.dataset.accion,
            Number(elemento.dataset.id),
            elemento.dataset.talla
        );
    });


    document.querySelector(
        "#finalizarCarritoGlobal"
    ).addEventListener("click", () => {

        if (carritoGlobal.length === 0) {
            return;
        }

        window.location.href =
            "checkout.html";
    });


    document.addEventListener(
        "keydown",
        (evento) => {

            if (evento.key === "Escape") {
                cerrarCarritoGlobal();
            }
        }
    );
});