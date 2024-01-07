import { Dropzone } from 'dropzone';

// const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

Dropzone.options.imagen = {
    // Todas las funciones que cambian el texto inician con dict(diccionario)
    dictDefaultMessage: 'Sube tus imágenes aquí',
    // archivos de formatos que soporta
    acceptedFiles: '.png,.jpg,.jpeg',
    // Máximo tamaño en megas
    maxFilesize: 5,
    // Cantidad Máxima de archivos
    maxFiles: 1,
    // Se pone la misma cantidad de maxFiles
    parallelUploads: 1,
    // Para que no se suba la imagen automáticamente al servidor
    autoProcessQueue: false,
    // Para poder eliminar la imagen
    addRemoveLinks: true,
    // Cambiar texto de eliminar
    dictRemoveFile: 'Borrar archivo',
    // Cambiar el texto del error al intentar subir mas archivos del permitido
    dictMaxFilesExceeded: 'El limite es un archivo',
    dictFileTooBig: 'El archivo debe pesar menos de 5 MB', // Mensaje para el peso máximo
    // Estos header se envían antes de la petición del req, puede servir para comprobar un token y Dropzone lo pide como 'CSRF-Token'.
    // headers: {
    //     'CSRF-Token': token
    // },

    // Para relacionar con upload.single('imagen') 
    paramName: 'imagen',

    // no va a permitir sobre el objeto de dropzone
    init: function () {
        // Obtener el objeto dropzone
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function () {
            dropzone.processQueue();
        });

        // Este se ejecuta cuando a finalizado el .processQueue()
        dropzone.on('queuecomplete', function () {
            // dropzone.getActiveFiles.length no dice cuantos archivos quedan en la cola
            if (dropzone.getActiveFiles.length == 0) {
                window.location.href = '/mis-propiedades';
            }
        });
    }
}