// importar ruta absoluta
import path from 'path';

export default {
    mode: 'development',
    entry: {
        mapa: './src/js/mapa.js',
        agregarImagen: './src/js/agregarImagen.js',
        mostrarMapa: './src/js/mostrarMapa.js',
        mapaInicio: './src/js/mapaInicio.js',
        cambiarEstado: './src/js/cambiarEstado.js',
    },
    output: {
        filename: '[name].js',
        /* Toca agregarle la ruta absoluta, porque dependiendo de donde se ejecute el proyecto va a ser una ruta diferente */
        path: path.resolve('public/js')
    }
}