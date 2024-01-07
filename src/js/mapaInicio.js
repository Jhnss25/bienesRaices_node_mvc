(function () {
    const lat = -0.1840585;
    const lng = -78.4943361;
    const mapa = L.map('mapa-inicio').setView([lat, lng], 13);

    // Estos markers van a ser una capa que van a estar encima de nuestro mapa
    // Al colocarlos de esta forma podemos limpiar el resultado previo 
    // Y podemos el resultado de una serie de filtros que vamos a poner
    // .FeatureGroup() - nos da una serie de funciones para utilizar como para limpiar los markers
    let markers = new L.FeatureGroup().addTo(mapa);

    // console.log(markers)

    // Para que al consultar a la BD, quede de forma global su valor y pueda usarla en otro lado de mi código.
    let propiedades = [];

    // Filtros, aquí voy colocando los valores
    const filtros = {
        categoria: '',
        precio: ''
    }

    // Selecciona los select para filtrar precios
    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Filtrado de Categorías y Precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        filtrarPropiedades();
    });
    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    });

    // Agrega el pin
    L.marker([lat, lng])
        .addTo(mapa)
    // .bindPopup('Calle').openPopup();
    
    const obtenerPropiedades = async () => {
        try {
            // No requieres poner toda la url, porque esta alojada en el mismo host
            const url = '/api/propiedades';
            const res = await fetch(url);
            propiedades = await res.json();

            mostrarPropiedades(propiedades);
        } catch (error) {
            console.log(error);
        }
    }

    const mostrarPropiedades = propiedades => {

        // Limpiar los markers previos
        // console.log(markers)
        markers.clearLayers();

        propiedades.forEach(propiedad => {
            // console.log(propiedad)
            // Agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen ${propiedad?.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase">Ver Propiedad</a>
            `)

            markers.addLayer(marker);
        })
    }

    const filtrarPropiedades = () => {
        // console.log(propiedades)

        // chaining - encadenar los métodos como filter
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)

        // console.log(resultado)
        mostrarPropiedades(resultado);
    }

    const filtrarCategoria = propiedad => filtros.categoria ? filtros.categoria === propiedad.categoriaId : propiedad;

    const filtrarPrecio = propiedad => filtros.precio ? filtros.precio === propiedad.precioId : propiedad;

    obtenerPropiedades();
})();