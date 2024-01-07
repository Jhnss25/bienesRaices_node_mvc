(function () {

    // ??(logical OR) - se ejecuta cuando es null o undefined
    const lat = document.querySelector('#lat').value || -0.1840585;
    const lng = document.querySelector('#lng').value || -78.4943361;
    const mapa = L.map('mapa').setView([lat, lng], 13);
    let marker;

    // Utilizar las librerías Provider y Geocoder
    // Esas librerías se agregan a L.
    // Esto no va a permitir obtener en base a las coordenadas el nombre de las calles.
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El Pin
    marker = new L.marker([lat, lng], {
        // para poder mover el pin
        draggable: true,
        // Una vez que muevas el pin se vuelva a centrar el mapa
        autoPan: true
    }).addTo(mapa);

    // Detectar el movimiento del pin
    marker.on('moveend', function (e) {
        marker = e.target;

        // Obtener la longitud y latitud al mover el pin
        const posicion = marker.getLatLng();

        // Centrar el mapa en las coordenadas dadas del posicion
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obtener la información de las calles al soltar el pin
        // Requiere el objeto entero de la posición de latitud y longitud.
        geocodeService.reverse().latlng(posicion, 13).run(function (error, resultado) {
            console.log(resultado);

            // Pone un Popup al pin y autoejecutarlo al cambiar de ubicación
            marker.bindPopup(resultado.address.LongLabel).openPopup();

            // Llenar los campos con la información del mapa al mover el pin
            // ? el optional chaining para que no marque un error si no existe
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        });
    })

})();