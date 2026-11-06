// ==========================================
// PÁGINA INDIVIDUAL DEL PRODUCTO
// ==========================================

const parametrosProducto =
    new URLSearchParams(window.location.search);

const idProductoActual =
    Number(parametrosProducto.get("id"));

const productoActual =
    productos.find(
        (producto) =>
            producto.id === idProductoActual
    );

let tallaSeleccionada = null;
let cantidadSeleccionada = 1;

let favoritos =
    leerLocalStorage(
        "barrio21_favoritos",
        []
    );

let carrito =
    leerLocalStorage(
        "barrio21_carrito",
        []
    );


// ==========================================
// MOSTRAR PRODUCTO
// ==========================================

function renderizarProducto() {

    if (!productoActual) {

        mostrarProductoNoEncontrado();
        return;
    }


    document.title =
        `${productoActual.nombre} | BARRIO21`;


    document.querySelector(
        "#rutaProducto"
    ).textContent = productoActual.nombre;


    const imagen =
        document.querySelector("#productoImagen");

    imagen.src = productoActual.imagen;
    imagen.alt = productoActual.nombre;


    document.querySelector(
        "#productoEtiqueta"
    ).textContent = productoActual.etiqueta;


    document.querySelector(
        "#productoCategoria"
    ).textContent =
        `${productoActual.categoria} · ${productoActual.tipo}`;


    document.querySelector(
        "#productoNombre"
    ).textContent = productoActual.nombre;


    document.querySelector(
        "#productoPrecio"
    ).textContent =
        formatearPrecio(productoActual.precio);


    const precioAnterior =
        document.querySelector(
            "#productoPrecioAnterior"
        );


    if (productoActual.precioAnterior) {

        precioAnterior.textContent =
            formatearPrecio(
                productoActual.precioAnterior
            );

        precioAnterior.style.display = "inline";

    } else {

        precioAnterior.textContent = "";
        precioAnterior.style.display = "none";
    }


    document.querySelector(
        "#productoDescripcion"
    ).textContent = productoActual.descripcion;


    document.querySelector(
        "#productoColor"
    ).textContent = productoActual.color;


    document.querySelector(
        "#productoSku"
    ).textContent = productoActual.sku;


    document.querySelector(
        "#productoStock"
    ).innerHTML = `
        <i class="fa-solid fa-circle"></i>
        ${productoActual.stock} unidades disponibles
    `;


    renderizarTallas();
    actualizarCantidadVisual();
    actualizarFavoritoProducto();
    renderizarRelacionados();
}


// ==========================================
// PRODUCTO NO ENCONTRADO
// ==========================================

function mostrarProductoNoEncontrado() {

    document.title =
        "Producto no encontrado | BARRIO21";


    document.querySelector(
        "#detalleProducto"
    ).innerHTML = `
        <div class="producto-no-encontrado">

            <span>ERROR 404</span>

            <h1>PRODUCTO NO ENCONTRADO</h1>

            <p>
                El producto solicitado no existe o ya no está disponible.
            </p>

            <a href="tienda.html">
                VOLVER A LA TIENDA
            </a>

        </div>
    `;


    document.querySelector(
        ".productos-relacionados"
    ).style.display = "none";
}


// ==========================================
// TALLAS
// ==========================================

function renderizarTallas() {

    const contenedor =
        document.querySelector("#productoTallas");


    contenedor.innerHTML =
        productoActual.tallas.map((talla) => `

            <button
                type="button"
                class="detalle-talla"
                data-talla="${talla}"
            >
                ${talla}
            </button>

        `).join("");
}


// ==========================================
// CANTIDAD
// ==========================================

function actualizarCantidadVisual() {

    document.querySelector(
        "#cantidadProducto"
    ).textContent = cantidadSeleccionada;
}


// ==========================================
// FAVORITOS
// ==========================================

function guardarFavoritos() {

    guardarLocalStorage(
    "barrio21_favoritos",
    favoritos
);
}


function actualizarContadorFavoritos() {

    const contador =
        document.querySelector(
            "#contadorFavoritosProducto"
        );

    contador.textContent = favoritos.length;

    contador.classList.toggle(
        "visible",
        favoritos.length > 0
    );
}


function actualizarFavoritoProducto() {

    if (!productoActual) {
        return;
    }


    const boton =
        document.querySelector(
            "#guardarProductoFavorito"
        );

    const icono =
        boton.querySelector("i");

    const esFavorito =
        favoritos.includes(productoActual.id);


    boton.classList.toggle(
        "activo",
        esFavorito
    );

    icono.classList.toggle(
        "fa-solid",
        esFavorito
    );

    icono.classList.toggle(
        "fa-regular",
        !esFavorito
    );

    boton.setAttribute(
        "aria-pressed",
        esFavorito
    );


    actualizarContadorFavoritos();
}


function alternarFavoritoProducto() {

    const id =
        productoActual.id;


    if (favoritos.includes(id)) {

        favoritos = favoritos.filter(
            (idFavorito) =>
                idFavorito !== id
        );

    } else {

        favoritos.push(id);
    }


    guardarFavoritos();
    actualizarFavoritoProducto();
}


// ==========================================
// CARRITO
// ==========================================

function guardarCarrito() {

    guardarLocalStorage(
        "barrio21_carrito",
        carrito
    );
}


function actualizarContadorCarrito() {

    const cantidadTotal =
    obtenerCantidadTotalCarrito(carrito);


    document.querySelector(
        "#contadorCarritoProducto"
    ).textContent = cantidadTotal;
}


function agregarProductoAlCarrito() {

    const errorTalla =
        document.querySelector(
            "#errorTallaProducto"
        );


    if (!tallaSeleccionada) {

        errorTalla.style.display = "block";

        document
            .querySelector("#productoTallas")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        return;
    }


    errorTalla.style.display = "none";


    // Leer el carrito actual: pudo cambiar desde el panel lateral

    carrito =
        leerLocalStorage(
            "barrio21_carrito",
            []
        );


    // El stock es del producto, así que se cuentan todas las tallas

    const disponibles =
        productoActual.stock -
        obtenerUnidadesProducto(
            carrito,
            productoActual.id
        );


    if (disponibles <= 0) {

        mostrarNotificacionProducto(
            "SIN STOCK DISPONIBLE",
            `Ya tienes todas las unidades de ${productoActual.nombre} en tu carrito.`
        );

        return;
    }


    const cantidadAgregar =
        Math.min(
            cantidadSeleccionada,
            disponibles
        );


    const itemExistente =
        carrito.find((item) =>
            item.id === productoActual.id &&
            item.talla === tallaSeleccionada
        );


    if (itemExistente) {

        itemExistente.cantidad += cantidadAgregar;

    } else {

        carrito.push({
            id: productoActual.id,
            talla: tallaSeleccionada,
            cantidad: cantidadAgregar
        });
    }


    guardarCarrito();
    actualizarContadorCarrito();


    mostrarNotificacionProducto(
        "AGREGADO AL CARRITO",
        `${productoActual.nombre} · Talla ${tallaSeleccionada}`
    );
}


// ==========================================
// NOTIFICACIÓN
// ==========================================

function mostrarNotificacionProducto(
    titulo,
    detalle
) {

    const notificacion =
        document.createElement("div");

    notificacion.className =
        "notificacion-carrito";

    notificacion.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        <div>
            <strong>${escaparHTML(titulo)}</strong>
            <span>${escaparHTML(detalle)}</span>
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


// ==========================================
// PRODUCTOS RELACIONADOS
// ==========================================

function obtenerProductosRelacionados() {

    const mismaCategoria =
        productos.filter((producto) =>
            producto.categoria ===
            productoActual.categoria &&
            producto.id !== productoActual.id
        );


    const otrasCategorias =
        productos.filter((producto) =>
            producto.categoria !==
            productoActual.categoria &&
            producto.id !== productoActual.id
        );


    return [
        ...mismaCategoria,
        ...otrasCategorias
    ].slice(0, 4);
}


function renderizarRelacionados() {

    const contenedor =
        document.querySelector(
            "#contenedorRelacionados"
        );

    const relacionados =
        obtenerProductosRelacionados();


    contenedor.innerHTML =
        relacionados.map((producto) => `

            <article class="producto">

                <div class="producto-imagen">

                    <a
                        href="producto.html?id=${producto.id}"
                        class="producto-imagen-enlace"
                    >
                        <img
                            src="${producto.imagen}"
                            alt="${producto.nombre}"
                            loading="lazy"
                        >
                    </a>

                    ${producto.etiqueta
                ? `
                                <span class="producto-etiqueta">
                                    ${producto.etiqueta}
                                </span>
                              `
                : ""
            }

                </div>

                <div class="producto-informacion">

                    <p class="producto-categoria">
                        ${producto.categoria}
                    </p>

                    <h3 class="producto-nombre">

                        <a href="producto.html?id=${producto.id}">
                            ${producto.nombre}
                        </a>

                    </h3>

                    <div class="producto-precios">

                        <span class="producto-precio">
                            ${formatearPrecio(producto.precio)}
                        </span>

                        ${producto.precioAnterior
                ? `
                                    <span class="producto-precio-anterior">
                                        ${formatearPrecio(
                    producto.precioAnterior
                )}
                                    </span>
                                  `
                : ""
            }

                    </div>

                    <a
                        href="producto.html?id=${producto.id}"
                        class="producto-agregar producto-ver"
                    >
                        VER PRODUCTO
                    </a>

                </div>

            </article>

        `).join("");
}


// ==========================================
// MENÚ MÓVIL
// ==========================================

function configurarMenuMovil() {

    const botonMenu =
        document.querySelector(
            "#botonMenuProducto"
        );

    const navbar =
        document.querySelector(
            "#navbarProducto"
        );

    const fondo =
        document.querySelector(
            "#menuFondoProducto"
        );

    const icono =
        botonMenu.querySelector("i");


    function cerrarMenu() {

        navbar.classList.remove("abierto");
        fondo.classList.remove("visible");

        document.body.classList.remove(
            "menu-abierto"
        );

        icono.classList.add("fa-bars");
        icono.classList.remove("fa-xmark");
    }


    botonMenu.addEventListener("click", () => {

        const abrir =
            !navbar.classList.contains("abierto");

        navbar.classList.toggle(
            "abierto",
            abrir
        );

        fondo.classList.toggle(
            "visible",
            abrir
        );

        document.body.classList.toggle(
            "menu-abierto",
            abrir
        );

        icono.classList.toggle(
            "fa-bars",
            !abrir
        );

        icono.classList.toggle(
            "fa-xmark",
            abrir
        );
    });


    fondo.addEventListener(
        "click",
        cerrarMenu
    );


    navbar.querySelectorAll("a").forEach((enlace) => {

        enlace.addEventListener(
            "click",
            cerrarMenu
        );
    });


    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {
            cerrarMenu();
        }
    });
}


// ==========================================
// EVENTOS PRINCIPALES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    colocarAnioActual("#anioProducto");


    actualizarContadorFavoritos();
    actualizarContadorCarrito();
    configurarMenuMovil();


    if (!productoActual) {

        mostrarProductoNoEncontrado();
        return;
    }


    renderizarProducto();


    const contenedorTallas =
        document.querySelector("#productoTallas");

    const disminuir =
        document.querySelector("#disminuirCantidad");

    const aumentar =
        document.querySelector("#aumentarCantidad");

    const agregar =
        document.querySelector("#agregarProductoCarrito");

    const botonFavorito =
        document.querySelector("#guardarProductoFavorito");

    const favoritosSuperiores =
        document.querySelector("#favoritoProductoSuperior");



    // Elegir talla

    contenedorTallas.addEventListener(
        "click",
        (evento) => {

            const boton =
                evento.target.closest(
                    ".detalle-talla"
                );

            if (!boton) {
                return;
            }


            document
                .querySelectorAll(".detalle-talla")
                .forEach((otroBoton) => {

                    otroBoton.classList.remove(
                        "activa"
                    );
                });


            boton.classList.add("activa");

            tallaSeleccionada =
                boton.dataset.talla;


            document.querySelector(
                "#errorTallaProducto"
            ).style.display = "none";
        }
    );


    // Cantidad

    disminuir.addEventListener("click", () => {

        if (cantidadSeleccionada > 1) {

            cantidadSeleccionada -= 1;
            actualizarCantidadVisual();
        }
    });


    aumentar.addEventListener("click", () => {

        if (
            cantidadSeleccionada <
            productoActual.stock
        ) {

            cantidadSeleccionada += 1;
            actualizarCantidadVisual();
        }
    });


    // Agregar al carrito

    agregar.addEventListener(
        "click",
        agregarProductoAlCarrito
    );


    // Favorito

    botonFavorito.addEventListener(
        "click",
        alternarFavoritoProducto
    );


    // Corazón superior: ver favoritos

    favoritosSuperiores.addEventListener(
        "click",
        () => {

            window.location.href =
                "tienda.html?favoritos=1";
        }
    );


});