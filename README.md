# BARRIO21

BARRIO21 es una tienda online de ropa urbana, streetwear y sneakers.

El frontend está hecho con HTML, CSS y JavaScript puro, con una interfaz adaptable para computadoras, tablets y celulares. El backend usa Node.js, Express y SQLite para guardar productos, stock y pedidos.

## Funcionalidades

- Catálogo dinámico de 24 productos.
- Búsqueda por nombre, tipo y color.
- Filtros por categoría.
- Ordenamiento de productos.
- Sistema de favoritos.
- Página individual para cada producto.
- Selección de talla y cantidad.
- Carrito lateral de compras.
- Modificación y eliminación de productos.
- Persistencia del carrito mediante localStorage.
- Formulario de checkout.
- Selección de método de pago demostrativo.
- Confirmación y generación de número de pedido.
- Diseño responsive para dispositivos móviles.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Font Awesome
- Google Fonts
- Node.js y Express (API REST)
- SQLite con better-sqlite3 (base de datos)
- node:test (pruebas automáticas)

## Páginas principales

- `index.html`: página de inicio.
- `tienda.html`: catálogo completo.
- `producto.html`: detalle de producto.
- `checkout.html`: resumen y confirmación del pedido.

## Ejecución local

Necesitas Node.js 20 o superior.

```bash
npm install
npm start
```

Abre http://localhost:3000. La base de datos se crea sola en `datos/barrio21.db` la primera vez, con los 24 productos de `js/productos.js`.

Otros comandos:

- `npm run dev`: reinicia el servidor al guardar cambios.
- `npm test`: ejecuta las pruebas de la API.

También puedes abrir `index.html` con Live Server. En ese caso la tienda funciona en **modo demostración**: usa el catálogo local y guarda los pedidos en el navegador.

## Arquitectura

```
Navegador (HTML, CSS, JS)
   │  fetch /api/...
   ▼
Express (server/app.js)
   ├── GET  /api/productos          catálogo con stock real
   ├── GET  /api/productos/:id      un producto
   ├── POST /api/pedidos            crea un pedido
   └── GET  /api/pedidos/:codigo    consulta un pedido
   │
   ▼
SQLite (server/db.js): productos, pedidos, pedido_productos
```

Decisiones importantes:

- **El servidor no confía en el navegador.** El cliente solo envía qué productos quiere, la talla y la cantidad. Los precios, el envío y el total se calculan en el servidor.
- **El stock se descuenta en una transacción.** Si un producto del pedido no tiene stock suficiente, no se guarda el pedido ni se descuenta nada.
- **Validación en el servidor.** Correo, celular de 9 dígitos, departamento, método de pago y contraentrega solo en Lima.
- **Solo se publican los archivos de la tienda.** `package.json`, el código del servidor y la base de datos no son accesibles desde el navegador.

### Estructura

```
server/
  index.js          inicia el servidor
  app.js            rutas y archivos públicos
  db.js             tablas y carga inicial
  catalogo.js       lee js/productos.js para llenar la base de datos
  validacion.js     reglas de los pedidos
  rutas/
    productos.js
    pedidos.js
test/
  api.test.js       pruebas de la API
js/
  api.js            conexión del frontend con la API
```

## Tipo de proyecto

Proyecto de portafolio. No procesa pagos reales: los métodos de pago son demostrativos.

## Demo en vivo

[Ver BARRIO21 funcionando](https://sebastian-lopez-dev.github.io/barrio21-ecommerce/)

La demo de GitHub Pages funciona en modo demostración, sin backend.

## Autor

Sebastian Alexander Lopez Cutipa  
Estudiante de Ingeniería de Sistemas e Informática.