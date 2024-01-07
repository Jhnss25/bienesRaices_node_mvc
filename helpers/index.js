const esVendedor = (usuarioId, propiedadUsuarioId) => {
    return usuarioId === propiedadUsuarioId;
}

const formatearFecha = fecha => {
    
    // Convierte la fecha a string pero no cambia el formato, como cuando pones t.toString()
    // Cortamos en 10, porque una fecha siempre va a ser 10, 4 en el año, 2 en mes, 2 en días, 2 guiones
    const nuevaFecha = new Date(fecha).toISOString().slice(0, 10);

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    // Transforma en fecha y luego formatea con las opciones, 'es-ES' es para que formatee a una fecha en español
    return new Date(nuevaFecha).toLocaleDateString('es-ES', opciones);
}

export {
    esVendedor,
    formatearFecha
}