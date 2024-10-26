// Variables y clases globales
class Producto {
    constructor(id, nombre, precio, imagen) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
    }
}

class Carrito {
    constructor() {
        this.items = [];
    }

    agregarProducto(producto) {
        this.items.push(producto);
        guardarEnStorage('carrito', this.items);
        renderizarCarrito();
        Swal.fire('Producto agregado', `${producto.nombre} ha sido añadido al carrito.`, 'success');
    }

    obtenerTotal() {
        return this.items.reduce((total, producto) => total + producto.precio, 0);
    }

    mostrarResumen() {
        let resumen = "";
        for (let producto of this.items) {
            resumen += `${producto.nombre} - $${producto.precio}\n`;
        }
        resumen += `\nTotal: $${this.obtenerTotal()}`;
        return resumen;
    }

    limpiarCarrito() {
        this.items = [];
        guardarEnStorage('carrito', this.items);
        renderizarCarrito();
    }
}

// Función para renderizar productos usando fetch
function renderizarProductos() {
    const listaProductos = document.getElementById('listaProductos');
    listaProductos.innerHTML = '';

    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(producto => {
                const divProducto = document.createElement('div');
                divProducto.classList.add('producto');
                divProducto.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${producto.precio}</p>
                    <button data-id="${producto.id}">Agregar al carrito</button>
                `;
                listaProductos.appendChild(divProducto);

                divProducto.querySelector('button').addEventListener('click', () => {
                    const carrito = obtenerCarrito();
                    carrito.agregarProducto(new Producto(producto.id, producto.nombre, producto.precio, producto.imagen));
                });
            });
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        });
}

// Funciones para renderizar y actualizar el carrito
function renderizarCarrito() {
    const resumenCarrito = document.getElementById('resumenCarrito');
    const carrito = obtenerCarrito();
    resumenCarrito.innerHTML = '';

    if (carrito.items.length > 0) {
        carrito.items.forEach(item => {
            resumenCarrito.innerHTML += `<p>${item.nombre} - $${item.precio}</p>`;
        });
        document.getElementById('btnFinalizarCompra').style.display = 'block';
    } else {
        resumenCarrito.innerHTML = '<p>El carrito está vacío.</p>';
        document.getElementById('btnFinalizarCompra').style.display = 'none';
    }
}

// Funciones de almacenamiento local
function guardarEnStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerCarrito() {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    const carrito = new Carrito();
    carrito.items = carritoGuardado;
    return carrito;
}

// Eventos e inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    renderizarCarrito();
    document.getElementById('btnFinalizarCompra').addEventListener('click', finalizarCompra);
});

function finalizarCompra() {
    const carrito = obtenerCarrito();
    if (carrito.items.length === 0) {
        Swal.fire('Carrito vacío', 'No tienes productos en el carrito', 'info');
    } else {
        Swal.fire({
            title: 'Resumen de compra',
            text: carrito.mostrarResumen(),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Finalizar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                carrito.limpiarCarrito();
            }
        });
    }
}
