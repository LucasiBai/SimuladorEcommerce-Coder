// LLamadas al DOM
const contenedorArticulos = document.getElementById("productosHtml");
const tipoMoneda = document.querySelector("#tipoMoneda");
let dolarCompra;

window.onload = () => {
	obtenerValorDolar();
};

// Estado Moneda
let dolares = JSON.parse(localStorage.getItem("dolares")) || false;
dolares ? (tipoMoneda.value = "usd") : null;

// Carrito
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Imprimir en DOM
// Función para imprimir los productos
function imprimirProductosAlContenedor(listaProductos) {
	// Limpiamos contenedor
	limpiarContenedor(contenedorArticulos);

	// Recorremos el array de productos
	for (let producto of listaProductos) {
		// Agregamos producto correspondiente
		contenedorArticulos.innerHTML += `<article class="articulos"><img src=${
			producto.img
		} class="articulos__img" />
    <h3 class="articulos__nombre">${producto.nombre}</h3>
    <h3 class="articulos__clasificacion">${producto.categoria}</h3>
    <div class="articulos__botton-precio">
      <h3 class="articulos__precio">${
				dolares ? "U$" : "$"
			}${producto.precio.toLocaleString("en-US", {
			minimumFractionDigits: 2,
		})}</h3>
      <button class="button button__carrito" id="agregarCarrito${producto.id}">
      Agregar al Carrito
      </button>
    </div></article>`;
	}

	// Damos propiedad a los botones
	listaProductos.forEach((producto) => {
		// Evento
		document
			.getElementById(`agregarCarrito${producto.id}`)
			.addEventListener("click", () => {
				agregarAlCarrito(producto);
			});
	});
}

// Función para limpiar el contenedor de productos
function limpiarContenedor(contenedor) {
	contenedor.innerHTML = "";
}

// Función filtrar
function filtrarProductos(categoria) {
	return productos.filter((producto) => producto.categoria == categoria);
}
// Array con productos por categoría
const productosEscritorios = filtrarProductos("Escritorios");
const productosEstanterias = filtrarProductos("Estanterías");
const productosHabitacion = filtrarProductos("Habitación");
const productosSillasYSillones = filtrarProductos("Sillas y Sillones");
const productosMesasYRatoneras = filtrarProductos("Mesas y Ratoneras");

let categoriaCargada = [...productos];
// Llamamos a los selectores
// Selector de categorías
const selectorCategorias = document.getElementById("selectorCategorias");
// Evento para cambiar categoría
selectorCategorias.addEventListener("change", (e) => {
	// Seleccionamos la categoria
	const categoriaSeleccionada = e.target.value;

	// Imprimimos la categoria seleccionada
	switch (categoriaSeleccionada) {
		case "escritorios":
			imprimirProductosSegunMoneda(productosEscritorios);
			selectorOrden.value = "none";
			break;
		case "estanterias":
			imprimirProductosSegunMoneda(productosEstanterias);
			selectorOrden.value = "none";
			break;
		case "habitacion":
			imprimirProductosSegunMoneda(productosHabitacion);
			selectorOrden.value = "none";
			break;
		case "sillasysillones":
			imprimirProductosSegunMoneda(productosSillasYSillones);
			selectorOrden.value = "none";
			break;
		case "mesasyratoneras":
			imprimirProductosSegunMoneda(productosMesasYRatoneras);
			selectorOrden.value = "none";
			break;
		default:
			imprimirProductosSegunMoneda(productos);
			selectorOrden.value = "none";
	}
});

function imprimirProductosSegunMoneda(productos) {
	dolares
		? cambiarTipoDeMoneda(dolarCompra, productos)
		: imprimirProductosAlContenedor(productos);
	categoriaCargada = [...productos];
}

// Selector de orden
const selectorOrden = document.getElementById("selectorOrden");
// Evento para cambiar orden
selectorOrden.addEventListener("change", (e) => {
	// Seleccionamos la categoria
	const ordenSeleccionado = e.target.value;
	// Imprimimos la categoria seleccionada
	ordenSeleccionado == "maM"
		? imprimirProductosSegunMoneda(
				categoriaCargada.sort((a, b) => a.precio - b.precio)
		  )
		: ordenSeleccionado == "Mam"
		? imprimirProductosSegunMoneda(
				categoriaCargada.sort((a, b) => b.precio - a.precio)
		  )
		: imprimirProductosSegunMoneda(categoriaCargada);
});

// Agregar al carrito
function agregarAlCarrito(productoAAgregar) {
	// Notificación de carga al carrito
	mostrarNotificacionCarrito(productoAAgregar);
	// condicional para no agregar de nuevo
	const encontrado = carrito.find(({ id }) => id == productoAAgregar.id);
	const productoOriginal = productos.filter(
		({ id }) => id == productoAAgregar.id
	);
	if (encontrado) {
		carrito.map((producto) =>
			producto.id == productoAAgregar.id ? (producto.cantidad += 1) : null
		);
	} else {
		carrito.push(productoOriginal[0]);
	}

	// Actualizamos el local storage
	localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Notificación de producto agregado al carrito
function mostrarNotificacionCarrito(productoAAgregar) {
	Toastify({
		text: `Has agregado ${productoAAgregar.nombre} al carrito.`,
		offset: {
			x: 50,
			y: 60,
		},
		position: "right",
		duration: 2000,
		style: {
			background: "linear-gradient(to right, #de8500, #c97900)",
		},
	}).showToast();
}

// Selector tipo moneda
tipoMoneda.addEventListener("change", (e) => {
	// Selección de tipo
	const monedaSeleccionada = e.target.value;
	// Determinamos la acción
	if (monedaSeleccionada == "ars") {
		dolares = false;
		imprimirProductosAlContenedor(categoriaCargada);
		localStorage.setItem("dolares", false);
	} else {
		dolares = true;
		cambiarTipoDeMoneda(dolarCompra, categoriaCargada);
		localStorage.setItem("dolares", true);
	}
});

function cambiarTipoDeMoneda(moneda, productos) {
	let productosDiferentePrecio = productos.map((producto) => ({
		...producto,
		precio: (producto.precio / parseFloat(moneda)).toFixed(2),
	}));
	imprimirProductosAlContenedor(productosDiferentePrecio);
}

async function obtenerValorDolar() {
	// Llamamos a la API
	const URLDOLAR =
		"https://www.dolarsi.com/api/api.php?type=valoresprincipales";
	const res = await fetch(URLDOLAR);
	const data = await res.json();
	const dolarBlue = data.find((dolar) => dolar.casa.nombre == "Dolar Blue");
	dolarCompra = dolarBlue.casa.compra;

	// Ejecutamos la impresión de los productos según estado de moneda
	dolares
		? cambiarTipoDeMoneda(dolarCompra, productos)
		: imprimirProductosAlContenedor(productos);
}
