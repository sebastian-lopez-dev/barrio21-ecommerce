// Recuperar favoritos guardados en el navegador

let favoritos =
    JSON.parse(localStorage.getItem("barrio21_favoritos")) || [];

// Productos mostrados únicamente en el inicio

const idsProductosDestacados = [
    1,
    3,
    7,
    11,
    15,
    17,
    22,
    23
];

const productosInicio = productos.filter(
    (producto) =>
        idsProductosDestacados.includes(producto.id)
);


// Convierte el precio al formato peruano

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN"
    }).format(precio);
}


// Crea las tarjetas de productos

function renderizarProductos(listaProductos = productos) {

    const contenedor = document.querySelector("#contenedorProductos");
    const contador = document.querySelector("#contadorProductos");

    contenedor.innerHTML = listaProductos.map((producto) => {

        return `
            <article class="producto" data-id="${producto.id}">

                <div class="producto-imagen">

                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                        loading="lazy"
                    >

                    ${producto.etiqueta
                ? `<span class="producto-etiqueta">
                                ${producto.etiqueta}
                               </span>`
                : ""
            }

                   <button
    class="producto-favorito ${favoritos.includes(producto.id) ? "activo" : ""
            }"
    data-id="${producto.id}"
    aria-label="Agregar ${producto.nombre} a favoritos"
    aria-pressed="${favoritos.includes(producto.id)}"
>
    <i class="${favoritos.includes(producto.id)
                ? "fa-solid"
                : "fa-regular"
            } fa-heart"></i>
</button>

                </div>

                <div class="producto-informacion">

                    <p class="producto-categoria">
                        ${producto.categoria}
                    </p>

                    <h3 class="producto-nombre">
                        ${producto.nombre}
                    </h3>

                    <div class="producto-precios">

                        <span class="producto-precio">
                            ${formatearPrecio(producto.precio)}
                        </span>

                        ${producto.precioAnterior
                ? `<span class="producto-precio-anterior">
                                    ${formatearPrecio(producto.precioAnterior)}
                        </span>`
                : ""
            }

                    </div>

                    <button
                        class="producto-agregar"
                        data-id="${producto.id}"
                    >
                        AGREGAR AL CARRITO
                    </button>

                </div>

            </article>
        `;

    }).join("");

    contador.textContent = `${listaProductos.length} PRODUCTOS`;
}


// Ejecutar cuando la página termine de cargar

document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos(productosInicio);
});
// ==========================================
// BUSCADOR, FILTROS Y ORDENAMIENTO
// ==========================================

let categoriaSeleccionada = "Todos";
let textoBusqueda = "";
let ordenSeleccionado = "destacados";
let mostrarSoloFavoritos = false;


function aplicarFiltros() {

    let productosFiltrados = productos.filter((producto) => {

        let coincideCategoria = true;

        if (categoriaSeleccionada === "Ropa") {

            coincideCategoria = [
                "Streetwear",
                "Pantalones",
                "Chaquetas"
            ].includes(producto.categoria);

        } else if (categoriaSeleccionada === "Novedades") {

            coincideCategoria =
                producto.etiqueta === "NUEVO";

        } else if (categoriaSeleccionada === "Ofertas") {

            coincideCategoria =
                producto.precioAnterior !== null;

        } else if (categoriaSeleccionada !== "Todos") {

            coincideCategoria =
                producto.categoria === categoriaSeleccionada;
        }

        const contenidoProducto =
            `${producto.nombre} ${producto.categoria}`.toLowerCase();

        const coincideBusqueda =
            contenidoProducto.includes(textoBusqueda.toLowerCase());

        const coincideFavorito =
            !mostrarSoloFavoritos ||
            favoritos.includes(producto.id);

        return (
            coincideCategoria &&
            coincideBusqueda &&
            coincideFavorito
        );
    });


    // Crear una copia antes de ordenar

    productosFiltrados = [...productosFiltrados];


    if (ordenSeleccionado === "menor-precio") {

        productosFiltrados.sort((a, b) => a.precio - b.precio);

    } else if (ordenSeleccionado === "mayor-precio") {

        productosFiltrados.sort((a, b) => b.precio - a.precio);

    } else if (ordenSeleccionado === "nombre") {

        productosFiltrados.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );
    }


    if (productosFiltrados.length === 0) {

        const contenedor =
            document.querySelector("#contenedorProductos");

        const contador =
            document.querySelector("#contadorProductos");

        contenedor.innerHTML = `
            <p class="sin-resultados">
                No encontramos productos con esa búsqueda.
            </p>
        `;

        contador.textContent = "0 PRODUCTOS";
        return;
    }


    renderizarProductos(productosFiltrados);
}


document.addEventListener("DOMContentLoaded", () => {

    const buscador =
        document.querySelector("#buscadorProductos");

    const botonesCategorias =
        document.querySelectorAll(".filtro-boton");

    const selectorOrden =
        document.querySelector("#ordenProductos");


    // Buscar mientras se escribe

    buscador.addEventListener("input", (evento) => {

        textoBusqueda = evento.target.value.trim();

        aplicarFiltros();
    });


    // Filtrar por categoría

    botonesCategorias.forEach((boton) => {

        boton.addEventListener("click", () => {

            botonesCategorias.forEach((otroBoton) => {
                otroBoton.classList.remove("activo");
            });

            boton.classList.add("activo");

            categoriaSeleccionada =
                boton.dataset.categoria;

            aplicarFiltros();
        });
    });


    // Ordenar productos

    selectorOrden.addEventListener("change", (evento) => {

        ordenSeleccionado = evento.target.value;

        aplicarFiltros();
    });
});

// ==========================================
// SISTEMA DE FAVORITOS
// ==========================================

function guardarFavoritos() {

    localStorage.setItem(
        "barrio21_favoritos",
        JSON.stringify(favoritos)
    );
}


function actualizarContadorFavoritos() {

    const contador =
        document.querySelector("#contadorFavoritos");

    contador.textContent = favoritos.length;

    contador.classList.toggle(
        "visible",
        favoritos.length > 0
    );
}


function alternarFavorito(idProducto, boton) {

    const yaEsFavorito =
        favoritos.includes(idProducto);

    if (yaEsFavorito) {

        favoritos = favoritos.filter(
            (id) => id !== idProducto
        );

    } else {

        favoritos.push(idProducto);
    }


    guardarFavoritos();
    actualizarContadorFavoritos();


    const estaActivo =
        favoritos.includes(idProducto);

    boton.classList.toggle("activo", estaActivo);
    boton.setAttribute("aria-pressed", estaActivo);

    const icono = boton.querySelector("i");

    icono.classList.toggle("fa-solid", estaActivo);
    icono.classList.toggle("fa-regular", !estaActivo);

    if (mostrarSoloFavoritos) {
        aplicarFiltros();
    }
}


document.addEventListener("DOMContentLoaded", () => {

    const contenedorProductos =
        document.querySelector("#contenedorProductos");

    actualizarContadorFavoritos();


    // Delegación de eventos:
    // funciona aunque los filtros vuelvan a crear las tarjetas

    contenedorProductos.addEventListener("click", (evento) => {

        const botonFavorito =
            evento.target.closest(".producto-favorito");

        if (!botonFavorito) {
            return;
        }

        const idProducto =
            Number(botonFavorito.dataset.id);

        alternarFavorito(
            idProducto,
            botonFavorito
        );
    });
});

// ==========================================
// MOSTRAR ÚNICAMENTE FAVORITOS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const botonFavoritos =
        document.querySelector("#botonFavoritos");

    const buscador =
        document.querySelector("#buscadorProductos");

    const botonesCategorias =
        document.querySelectorAll(".filtro-boton");


    botonFavoritos.addEventListener("click", () => {

        mostrarSoloFavoritos =
            !mostrarSoloFavoritos;


        // Reiniciar buscador y categorías

        textoBusqueda = "";
        categoriaSeleccionada = "Todos";

        buscador.value = "";

        botonesCategorias.forEach((boton) => {

            const esTodos =
                boton.dataset.categoria === "Todos";

            boton.classList.toggle(
                "activo",
                esTodos
            );
        });


        // Cambiar apariencia del botón superior

        botonFavoritos.classList.toggle(
            "mostrando-favoritos",
            mostrarSoloFavoritos
        );

        const icono =
            botonFavoritos.querySelector("i");

        icono.classList.toggle(
            "fa-solid",
            mostrarSoloFavoritos
        );

        icono.classList.toggle(
            "fa-regular",
            !mostrarSoloFavoritos
        );


        aplicarFiltros();


        // Bajar automáticamente al catálogo

        document
            .querySelector("#productos")
            .scrollIntoView({
                behavior: "smooth"
            });
    });
});


// ==========================================
// VISTA RÁPIDA Y SELECCIÓN DE TALLA
// ==========================================

const tallasPorCategoria = {
    Streetwear: ["S", "M", "L", "XL"],
    Pantalones: ["28", "30", "32", "34", "36"],
    Chaquetas: ["S", "M", "L", "XL"],
    Sneakers: ["38", "39", "40", "41", "42"],
    Accesorios: ["ÚNICA"]
};

let productoModalActual = null;
let tallaSeleccionada = null;


function abrirModalProducto(idProducto) {

    const producto = productos.find(
        (item) => item.id === idProducto
    );

    if (!producto) {
        return;
    }

    productoModalActual = producto;
    tallaSeleccionada = null;

    const modal =
        document.querySelector("#modalProducto");

    const imagen =
        document.querySelector("#modalImagen");

    const categoria =
        document.querySelector("#modalCategoria");

    const nombre =
        document.querySelector("#modalNombre");

    const precio =
        document.querySelector("#modalPrecio");

    const descripcion =
        document.querySelector("#modalDescripcion");

    const contenedorTallas =
        document.querySelector("#modalTallas");

    const botonAgregar =
        document.querySelector("#modalAgregarCarrito");

    const mensajeTalla =
        document.querySelector("#mensajeTalla");


    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;

    categoria.textContent = producto.categoria;
    nombre.textContent = producto.nombre;
    precio.textContent = formatearPrecio(producto.precio);

    descripcion.textContent =
        "Una pieza seleccionada por BARRIO21 para completar un estilo urbano, auténtico y diferente.";


    const tallas =
        tallasPorCategoria[producto.categoria] || ["ÚNICA"];

    contenedorTallas.innerHTML = tallas.map((talla) => `
        <button
            type="button"
            class="talla-boton"
            data-talla="${talla}"
        >
            ${talla}
        </button>
    `).join("");


    botonAgregar.disabled = true;
    botonAgregar.textContent = "SELECCIONA UNA TALLA";

    mensajeTalla.style.display = "none";

    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-abierto");
}


function cerrarModalProducto() {

    const modal =
        document.querySelector("#modalProducto");

    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-abierto");

    productoModalActual = null;
    tallaSeleccionada = null;
}


document.addEventListener("DOMContentLoaded", () => {

    const contenedorProductos =
        document.querySelector("#contenedorProductos");

    const modal =
        document.querySelector("#modalProducto");

    const cerrarModal =
        document.querySelector("#cerrarModalProducto");

    const contenedorTallas =
        document.querySelector("#modalTallas");

    const botonAgregar =
        document.querySelector("#modalAgregarCarrito");


    // Abrir modal al pulsar imagen o botón

    contenedorProductos.addEventListener("click", (evento) => {

        const elementoSeleccionado =
            evento.target.closest(
                ".producto-imagen, .producto-agregar"
            );

        if (!elementoSeleccionado) {
            return;
        }

        const tarjeta =
            elementoSeleccionado.closest(".producto");

        const idProducto =
            Number(tarjeta.dataset.id);

        abrirModalProducto(idProducto);
    });


    // Seleccionar talla

    contenedorTallas.addEventListener("click", (evento) => {

        const botonTalla =
            evento.target.closest(".talla-boton");

        if (!botonTalla) {
            return;
        }

        document
            .querySelectorAll(".talla-boton")
            .forEach((boton) => {
                boton.classList.remove("activa");
            });

        botonTalla.classList.add("activa");

        tallaSeleccionada =
            botonTalla.dataset.talla;

        botonAgregar.disabled = false;
        botonAgregar.textContent = "AGREGAR AL CARRITO";
    });


    // Cerrar con la X

    cerrarModal.addEventListener(
        "click",
        cerrarModalProducto
    );


    // Cerrar al pulsar el fondo oscuro

    modal.addEventListener("click", (evento) => {

        if (evento.target === modal) {
            cerrarModalProducto();
        }
    });


    // Cerrar con la tecla Escape

    document.addEventListener("keydown", (evento) => {

        if (
            evento.key === "Escape" &&
            modal.classList.contains("visible")
        ) {
            cerrarModalProducto();
        }
    });
});

// ==========================================
// CARRITO DE COMPRAS
// ==========================================

let carrito =
    JSON.parse(localStorage.getItem("barrio21_carrito")) || [];


function guardarCarrito() {

    localStorage.setItem(
        "barrio21_carrito",
        JSON.stringify(carrito)
    );
}


function actualizarContadorCarrito() {

    const contador =
        document.querySelector("#contadorCarrito");

    const cantidadTotal = carrito.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    contador.textContent = cantidadTotal;
}


function mostrarNotificacionCarrito(producto, talla) {

    const notificacion =
        document.createElement("div");

    notificacion.className =
        "notificacion-carrito";

    notificacion.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        <div>
            <strong>AGREGADO AL CARRITO</strong>

            <span>
                ${producto.nombre} · Talla ${talla}
            </span>
        </div>
    `;

    document.body.appendChild(notificacion);


    requestAnimationFrame(() => {
        notificacion.classList.add("visible");
    });


    setTimeout(() => {

        notificacion.classList.remove("visible");

        setTimeout(() => {
            notificacion.remove();
        }, 300);

    }, 2500);
}


function agregarAlCarrito(producto, talla) {

    const productoExistente =
        carrito.find((item) =>
            item.id === producto.id &&
            item.talla === talla
        );


    if (productoExistente) {

        productoExistente.cantidad += 1;

    } else {

        carrito.push({
            id: producto.id,
            talla: talla,
            cantidad: 1
        });
    }


    guardarCarrito();
    actualizarContadorCarrito();

    mostrarNotificacionCarrito(
        producto,
        talla
    );
}


document.addEventListener("DOMContentLoaded", () => {

    const botonAgregar =
        document.querySelector("#modalAgregarCarrito");


    // Mostrar la cantidad guardada al cargar la página

    actualizarContadorCarrito();


    // Agregar el producto seleccionado

    botonAgregar.addEventListener("click", () => {

        if (
            !productoModalActual ||
            !tallaSeleccionada
        ) {
            return;
        }


        agregarAlCarrito(
            productoModalActual,
            tallaSeleccionada
        );


        cerrarModalProducto();
    });
});

// ==========================================
// PANEL LATERAL DEL CARRITO
// ==========================================

function renderizarCarrito() {

    const contenedor =
        document.querySelector("#carritoContenido");

    const resumen =
        document.querySelector("#carritoResumen");

    const subtotalElemento =
        document.querySelector("#carritoSubtotal");

    const cantidadTexto =
        document.querySelector("#carritoCantidadTexto");


    const cantidadTotal = carrito.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    cantidadTexto.textContent =
        `(${cantidadTotal})`;


    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <div class="carrito-vacio">

                <i class="fa-solid fa-bag-shopping"></i>

                <h3>TU CARRITO ESTÁ VACÍO</h3>

                <p>
                    Explora la colección y encuentra tu próximo estilo.
                </p>

            </div>
        `;

        resumen.classList.add("oculto");
        return;
    }


    let subtotal = 0;


    contenedor.innerHTML = carrito.map((item) => {

        const producto = productos.find(
            (producto) => producto.id === item.id
        );

        if (!producto) {
            return "";
        }


        const totalProducto =
            producto.precio * item.cantidad;

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
                                aria-label="Disminuir cantidad"
                            >
                                −
                            </button>

                            <span>${item.cantidad}</span>

                            <button
                                data-accion="aumentar"
                                aria-label="Aumentar cantidad"
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
}


function abrirCarrito() {

    renderizarCarrito();

    document
        .querySelector("#carritoPanel")
        .classList.add("visible");

    document
        .querySelector("#carritoFondo")
        .classList.add("visible");

    document
        .querySelector("#carritoPanel")
        .setAttribute("aria-hidden", "false");

    document.body.classList.add("carrito-abierto");
}


function cerrarCarrito() {

    document
        .querySelector("#carritoPanel")
        .classList.remove("visible");

    document
        .querySelector("#carritoFondo")
        .classList.remove("visible");

    document
        .querySelector("#carritoPanel")
        .setAttribute("aria-hidden", "true");

    document.body.classList.remove("carrito-abierto");
}


document.addEventListener("DOMContentLoaded", () => {

    const botonCarrito =
        document.querySelector("#botonCarrito");

    const botonCerrar =
        document.querySelector("#cerrarCarrito");

    const fondo =
        document.querySelector("#carritoFondo");

    const seguirComprando =
        document.querySelector("#seguirComprando");

    const contenedor =
        document.querySelector("#carritoContenido");


    botonCarrito.addEventListener(
        "click",
        abrirCarrito
    );

    botonCerrar.addEventListener(
        "click",
        cerrarCarrito
    );

    fondo.addEventListener(
        "click",
        cerrarCarrito
    );

    seguirComprando.addEventListener(
        "click",
        cerrarCarrito
    );


    // Aumentar, disminuir o eliminar

    contenedor.addEventListener("click", (evento) => {

        const boton =
            evento.target.closest("[data-accion]");

        if (!boton) {
            return;
        }


        const itemElemento =
            boton.closest(".carrito-item");

        const idProducto =
            Number(itemElemento.dataset.id);

        const talla =
            itemElemento.dataset.talla;

        const itemCarrito =
            carrito.find((item) =>
                item.id === idProducto &&
                item.talla === talla
            );


        if (!itemCarrito) {
            return;
        }


        const accion =
            boton.dataset.accion;


        if (accion === "aumentar") {

            itemCarrito.cantidad += 1;

        } else if (
            accion === "disminuir" &&
            itemCarrito.cantidad > 1
        ) {

            itemCarrito.cantidad -= 1;

        } else if (accion === "eliminar") {

            carrito = carrito.filter((item) =>
                !(
                    item.id === idProducto &&
                    item.talla === talla
                )
            );
        }


        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
    });


    // Cerrar con Escape

    document.addEventListener("keydown", (evento) => {

        if (
            evento.key === "Escape" &&
            document
                .querySelector("#carritoPanel")
                .classList.contains("visible")
        ) {
            cerrarCarrito();
        }
    });
});

// ==========================================
// CHECKOUT DEMOSTRATIVO
// ==========================================

function calcularSubtotalCarrito() {

    return carrito.reduce((total, item) => {

        const producto = productos.find(
            (producto) => producto.id === item.id
        );

        if (!producto) {
            return total;
        }

        return total +
            producto.precio * item.cantidad;

    }, 0);
}


function renderizarResumenCheckout() {

    const contenedor =
        document.querySelector("#checkoutProductos");

    const subtotal = calcularSubtotalCarrito();

    const envio =
        subtotal >= 199 ? 0 : 10;

    const total =
        subtotal + envio;


    contenedor.innerHTML = carrito.map((item) => {

        const producto = productos.find(
            (producto) => producto.id === item.id
        );

        if (!producto) {
            return "";
        }

        return `
            <div class="checkout-producto">

                <div>
                    <strong>${producto.nombre}</strong>

                    <span>
                        Talla ${item.talla} ·
                        Cantidad ${item.cantidad}
                    </span>
                </div>

                <strong>
                    ${formatearPrecio(
            producto.precio * item.cantidad
        )}
                </strong>

            </div>
        `;

    }).join("");


    document.querySelector(
        "#checkoutSubtotal"
    ).textContent = formatearPrecio(subtotal);


    document.querySelector(
        "#checkoutEnvio"
    ).textContent =
        envio === 0
            ? "GRATIS"
            : formatearPrecio(envio);


    document.querySelector(
        "#checkoutTotal"
    ).textContent = formatearPrecio(total);


    return {
        subtotal,
        envio,
        total
    };
}


function abrirCheckout() {

    if (carrito.length === 0) {
        return;
    }

    cerrarCarrito();

    document
        .querySelector("#checkoutFormularioVista")
        .classList.remove("oculto");

    document
        .querySelector("#checkoutExito")
        .classList.add("oculto");

    renderizarResumenCheckout();

    document
        .querySelector("#checkoutFondo")
        .classList.add("visible");

    document
        .querySelector("#checkoutFondo")
        .setAttribute("aria-hidden", "false");

    document.body.classList.add("checkout-abierto");
}


function cerrarCheckout() {

    document
        .querySelector("#checkoutFondo")
        .classList.remove("visible");

    document
        .querySelector("#checkoutFondo")
        .setAttribute("aria-hidden", "true");

    document.body.classList.remove("checkout-abierto");
}


document.addEventListener("DOMContentLoaded", () => {

    const botonFinalizar =
        document.querySelector("#finalizarCompra");

    const botonCerrar =
        document.querySelector("#cerrarCheckout");

    const fondo =
        document.querySelector("#checkoutFondo");

    const formulario =
        document.querySelector("#formCheckout");

    const volverTienda =
        document.querySelector("#volverTienda");


    botonFinalizar.addEventListener(
        "click",
        () => {
            window.location.href = "checkout.html";
        }
    );

    botonCerrar.addEventListener(
        "click",
        cerrarCheckout
    );

    volverTienda.addEventListener(
        "click",
        cerrarCheckout
    );


    fondo.addEventListener("click", (evento) => {

        if (evento.target === fondo) {
            cerrarCheckout();
        }
    });


    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();


        if (!formulario.checkValidity()) {

            formulario.reportValidity();
            return;
        }


        const datosCliente =
            Object.fromEntries(
                new FormData(formulario)
            );

        const totales =
            renderizarResumenCheckout();

        const codigo =
            `B21-${Date.now()
                .toString()
                .slice(-7)}`;


        const pedido = {
            codigo: codigo,
            fecha: new Date().toISOString(),
            cliente: datosCliente,
            productos: [...carrito],
            subtotal: totales.subtotal,
            envio: totales.envio,
            total: totales.total,
            estado: "CONFIRMADO"
        };


        const pedidosGuardados =
            JSON.parse(
                localStorage.getItem("barrio21_pedidos")
            ) || [];


        pedidosGuardados.push(pedido);


        localStorage.setItem(
            "barrio21_pedidos",
            JSON.stringify(pedidosGuardados)
        );


        document.querySelector(
            "#codigoPedido"
        ).textContent = codigo;


        document.querySelector(
            "#totalPedidoConfirmado"
        ).textContent =
            formatearPrecio(totales.total);


        carrito = [];

        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();

        formulario.reset();


        document
            .querySelector("#checkoutFormularioVista")
            .classList.add("oculto");

        document
            .querySelector("#checkoutExito")
            .classList.remove("oculto");
    });


    document.addEventListener("keydown", (evento) => {

        if (
            evento.key === "Escape" &&
            fondo.classList.contains("visible")
        ) {
            cerrarCheckout();
        }
    });
});

// ==========================================
// MENÚ MÓVIL Y ENLACES DEL NAVBAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const botonMenu =
        document.querySelector("#botonMenu");

    const navbar =
        document.querySelector("#navbar");

    const fondoMenu =
        document.querySelector("#menuFondo");

    const enlacesNavbar =
        navbar.querySelectorAll("a");


    function cerrarMenuMovil() {

        navbar.classList.remove("abierto");
        fondoMenu.classList.remove("visible");

        document.body.classList.remove(
            "menu-abierto"
        );

        const icono =
            botonMenu.querySelector("i");

        icono.classList.add("fa-bars");
        icono.classList.remove("fa-xmark");
    }


    botonMenu.addEventListener("click", () => {

        const abrir =
            !navbar.classList.contains("abierto");

        navbar.classList.toggle("abierto", abrir);
        fondoMenu.classList.toggle("visible", abrir);

        document.body.classList.toggle(
            "menu-abierto",
            abrir
        );

        const icono =
            botonMenu.querySelector("i");

        icono.classList.toggle("fa-bars", !abrir);
        icono.classList.toggle("fa-xmark", abrir);
    });


    fondoMenu.addEventListener(
        "click",
        cerrarMenuMovil
    );


    enlacesNavbar.forEach((enlace) => {

        enlace.addEventListener("click", () => {

            cerrarMenuMovil();


            enlacesNavbar.forEach((otroEnlace) => {
                otroEnlace.classList.remove("activo");
            });

            enlace.classList.add("activo");


            const filtro =
                enlace.dataset.filtroNav;

            if (!filtro) {
                return;
            }


            categoriaSeleccionada = filtro;
            textoBusqueda = "";
            mostrarSoloFavoritos = false;


            document.querySelector(
                "#buscadorProductos"
            ).value = "";


            document
                .querySelectorAll(".filtro-boton")
                .forEach((boton) => {

                    boton.classList.toggle(
                        "activo",
                        boton.dataset.categoria === filtro
                    );
                });


            const botonFavoritos =
                document.querySelector("#botonFavoritos");

            botonFavoritos.classList.remove(
                "mostrando-favoritos"
            );

            const iconoFavoritos =
                botonFavoritos.querySelector("i");

            iconoFavoritos.classList.remove("fa-solid");
            iconoFavoritos.classList.add("fa-regular");


            aplicarFiltros();
        });
    });


    // Cerrar el menú al pasar de celular a computadora

    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {
            cerrarMenuMovil();
        }
    });
});

// ==========================================
// BOTONES DE COLECCIONES EDITORIALES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const botonesEditoriales =
        document.querySelectorAll(
            "[data-filtro-editorial]"
        );


    botonesEditoriales.forEach((boton) => {

        boton.addEventListener("click", () => {

            const filtro =
                boton.dataset.filtroEditorial;


            categoriaSeleccionada = filtro;
            textoBusqueda = "";
            mostrarSoloFavoritos = false;


            document.querySelector(
                "#buscadorProductos"
            ).value = "";


            document
                .querySelectorAll(".filtro-boton")
                .forEach((botonFiltro) => {

                    botonFiltro.classList.toggle(
                        "activo",
                        botonFiltro.dataset.categoria === filtro
                    );
                });


            const botonFavoritos =
                document.querySelector("#botonFavoritos");

            botonFavoritos.classList.remove(
                "mostrando-favoritos"
            );


            const iconoFavoritos =
                botonFavoritos.querySelector("i");

            iconoFavoritos.classList.remove("fa-solid");
            iconoFavoritos.classList.add("fa-regular");


            aplicarFiltros();


            document
                .querySelector("#productos")
                .scrollIntoView({
                    behavior: "smooth"
                });
        });
    });
});

// ==========================================
// NEWSLETTER Y FOOTER
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const formulario =
        document.querySelector("#formNewsletter");

    const correo =
        document.querySelector("#correoNewsletter");

    const mensaje =
        document.querySelector("#mensajeNewsletter");

    const anio =
        document.querySelector("#anioActual");


    anio.textContent =
        new Date().getFullYear();


    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();


        if (!formulario.checkValidity()) {

            formulario.reportValidity();
            return;
        }


        const correoIngresado =
            correo.value.trim().toLowerCase();


        const suscriptores =
            JSON.parse(
                localStorage.getItem(
                    "barrio21_suscriptores"
                )
            ) || [];


        if (suscriptores.includes(correoIngresado)) {

            mensaje.textContent =
                "Este correo ya está registrado.";

            return;
        }


        suscriptores.push(correoIngresado);


        localStorage.setItem(
            "barrio21_suscriptores",
            JSON.stringify(suscriptores)
        );


        mensaje.textContent =
            "¡Bienvenido al barrio! Suscripción registrada.";

        formulario.reset();


        setTimeout(() => {
            mensaje.textContent = "";
        }, 4000);
    });
});