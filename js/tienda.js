// ==========================================
// TIENDA BARRIO21
// ==========================================

const parametrosURL =
    new URLSearchParams(window.location.search);

let categoriaSeleccionada =
    parametrosURL.get("categoria") || "Todos";

let textoBusqueda = "";
let ordenSeleccionado = "destacados";
let mostrarSoloFavoritos =
    parametrosURL.get("favoritos") === "1";

let favoritos =
    leerLocalStorage(
        "barrio21_favoritos",
        []
    );







// ==========================================
// RENDERIZAR PRODUCTOS
// ==========================================

function renderizarProductos(listaProductos) {

    const contenedor =
        document.querySelector("#contenedorProductos");

    const contador =
        document.querySelector("#contadorProductos");


    contador.textContent =
        `${listaProductos.length} PRODUCTOS`;


    if (listaProductos.length === 0) {

        contenedor.innerHTML = `
            <div class="sin-resultados">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>NO ENCONTRAMOS PRODUCTOS</h3>

                <p>
                    Prueba con otra palabra o categoría.
                </p>

            </div>
        `;

        return;
    }


    contenedor.innerHTML = listaProductos.map((producto) => {

        const esFavorito =
            favoritos.includes(producto.id);

        return `
            <article
                class="producto"
                data-id="${producto.id}"
            >

                <div class="producto-imagen">

                    <a
                        href="producto.html?id=${producto.id}"
                        class="producto-imagen-enlace"
                        aria-label="Ver ${producto.nombre}"
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

                    <button
                        class="producto-favorito ${esFavorito ? "activo" : ""
            }"
                        data-id="${producto.id}"
                        aria-label="Guardar ${producto.nombre}"
                        aria-pressed="${esFavorito}"
                    >
                        <i class="${esFavorito
                ? "fa-solid"
                : "fa-regular"
            } fa-heart"></i>
                    </button>

                </div>


                <div class="producto-informacion">

                    <p class="producto-categoria">
                        ${producto.categoria} · ${producto.color}
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
        `;

    }).join("");
}


// ==========================================
// FILTRAR Y ORDENAR
// ==========================================

function aplicarFiltros() {

    let resultado = productos.filter((producto) => {

        let coincideCategoria = true;


        if (categoriaSeleccionada === "Ropa") {

            coincideCategoria = [
                "Streetwear",
                "Pantalones",
                "Chaquetas"
            ].includes(producto.categoria);

        } else if (
            categoriaSeleccionada === "Novedades"
        ) {

            coincideCategoria =
                producto.etiqueta === "NUEVO";

        } else if (
            categoriaSeleccionada === "Ofertas"
        ) {

            coincideCategoria =
                producto.precioAnterior !== null;

        } else if (
            categoriaSeleccionada !== "Todos"
        ) {

            coincideCategoria =
                producto.categoria ===
                categoriaSeleccionada;
        }


        const contenido = `
            ${producto.nombre}
            ${producto.categoria}
            ${producto.tipo}
            ${producto.color}
            ${producto.sku}
        `.toLowerCase();


        const coincideBusqueda =
            contenido.includes(
                textoBusqueda.toLowerCase()
            );


        const coincideFavorito =
            !mostrarSoloFavoritos ||
            favoritos.includes(producto.id);


        return (
            coincideCategoria &&
            coincideBusqueda &&
            coincideFavorito
        );
    });


    resultado = [...resultado];


    if (ordenSeleccionado === "menor-precio") {

        resultado.sort(
            (a, b) => a.precio - b.precio
        );

    } else if (
        ordenSeleccionado === "mayor-precio"
    ) {

        resultado.sort(
            (a, b) => b.precio - a.precio
        );

    } else if (ordenSeleccionado === "nombre") {

        resultado.sort((a, b) =>
            a.nombre.localeCompare(
                b.nombre,
                "es"
            )
        );
    }


    renderizarProductos(resultado);
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


function actualizarFavoritosSuperiores() {

    const contador =
        document.querySelector(
            "#contadorFavoritosTienda"
        );

    const boton =
        document.querySelector(
            "#botonFavoritosTienda"
        );

    const icono =
        boton.querySelector("i");


    contador.textContent = favoritos.length;

    contador.classList.toggle(
        "visible",
        favoritos.length > 0
    );

    boton.classList.toggle(
        "mostrando-favoritos",
        mostrarSoloFavoritos
    );

    icono.classList.toggle(
        "fa-solid",
        mostrarSoloFavoritos
    );

    icono.classList.toggle(
        "fa-regular",
        !mostrarSoloFavoritos
    );
}


// ==========================================
// CONTADOR DEL CARRITO
// ==========================================

function actualizarContadorCarritoTienda() {

    const carrito =
        leerLocalStorage(
            "barrio21_carrito",
            []
        );

    const cantidad =
        obtenerCantidadTotalCarrito(carrito);

    document.querySelector(
        "#contadorCarritoTienda"
    ).textContent = cantidad;
}


// ==========================================
// ESTADO VISUAL DE FILTROS
// ==========================================

function actualizarBotonesCategorias() {

    document
        .querySelectorAll(".filtro-boton")
        .forEach((boton) => {

            boton.classList.toggle(
                "activo",
                boton.dataset.categoria ===
                categoriaSeleccionada
            );
        });
}


function actualizarNavbarActivo() {

    document
        .querySelectorAll(
            "[data-categoria-nav]"
        )
        .forEach((enlace) => {

            enlace.classList.toggle(
                "activo",
                enlace.dataset.categoriaNav ===
                categoriaSeleccionada
            );
        });
}


// ==========================================
// EVENTOS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const buscador =
        document.querySelector("#buscadorProductos");

    const selectorOrden =
        document.querySelector("#ordenProductos");

    const botonesCategorias =
        document.querySelectorAll(".filtro-boton");

    const contenedorProductos =
        document.querySelector("#contenedorProductos");

    const botonFavoritos =
        document.querySelector(
            "#botonFavoritosTienda"
        );

    const botonBuscar =
        document.querySelector("#enfocarBuscador");



    // Año del footer

    colocarAnioActual("#anioTienda");

    actualizarBotonesCategorias();
    actualizarNavbarActivo();
    actualizarFavoritosSuperiores();
    actualizarContadorCarritoTienda();
    aplicarFiltros();


    // Buscar mientras se escribe

    buscador.addEventListener("input", (evento) => {

        textoBusqueda =
            evento.target.value.trim();

        aplicarFiltros();
    });


    // Enfocar buscador desde el navbar

    botonBuscar.addEventListener("click", () => {

        document
            .querySelector("#productos")
            .scrollIntoView({
                behavior: "smooth"
            });

        setTimeout(() => {
            buscador.focus();
        }, 500);
    });

    // Cambiar categoría

    botonesCategorias.forEach((boton) => {

        boton.addEventListener("click", () => {

            categoriaSeleccionada =
                boton.dataset.categoria;

            mostrarSoloFavoritos = false;

            actualizarBotonesCategorias();
            actualizarFavoritosSuperiores();
            aplicarFiltros();
        });
    });


    // Ordenar

    selectorOrden.addEventListener(
        "change",
        (evento) => {

            ordenSeleccionado =
                evento.target.value;

            aplicarFiltros();
        }
    );


    // Guardar o retirar favorito

    contenedorProductos.addEventListener(
        "click",
        (evento) => {

            const boton =
                evento.target.closest(
                    ".producto-favorito"
                );

            if (!boton) {
                return;
            }


            const idProducto =
                Number(boton.dataset.id);


            if (favoritos.includes(idProducto)) {

                favoritos = favoritos.filter(
                    (id) => id !== idProducto
                );

            } else {

                favoritos.push(idProducto);
            }


            guardarFavoritos();
            actualizarFavoritosSuperiores();
            aplicarFiltros();
        }
    );


    // Mostrar solamente favoritos

    botonFavoritos.addEventListener(
        "click",
        () => {

            mostrarSoloFavoritos =
                !mostrarSoloFavoritos;

            categoriaSeleccionada = "Todos";
            textoBusqueda = "";

            buscador.value = "";

            actualizarBotonesCategorias();
            actualizarFavoritosSuperiores();
            aplicarFiltros();

            document
                .querySelector("#productos")
                .scrollIntoView({
                    behavior: "smooth"
                });
        }
    );
});


// ==========================================
// MENÚ MÓVIL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const botonMenu =
        document.querySelector("#botonMenuTienda");

    const navbar =
        document.querySelector("#navbar");

    const fondo =
        document.querySelector("#menuFondoTienda");

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

        navbar.classList.toggle("abierto", abrir);
        fondo.classList.toggle("visible", abrir);

        document.body.classList.toggle(
            "menu-abierto",
            abrir
        );

        icono.classList.toggle("fa-bars", !abrir);
        icono.classList.toggle("fa-xmark", abrir);
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
});