import multer from 'multer';
// Nos retorna la ubicación en el disco duro, porque cuando haga el deployment la ubicación va a ser diferente
import path from 'path';
import { generarId } from '../helpers/tokens.js';

const storage = multer.diskStorage({
    // Aquí es donde se van a guardar los archivos
    destination: function (req, file, callback) {
        // console.log(req)
        // console.log(file)

        callback(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        // console.log(file);
  
        // Generar id es el nombre del archivo, es para que no se guarden con el mismo nombre, porque en una carpeta no puede haber 2 archivos con el mismo nombre
        // path.extname() - trae la extension de un archivo (.jpg, .png, etc)
        if (file) {
            cb(null, generarId() + path.extname(file.originalname))
        }
    }
});

const upload = multer({ storage });

export default upload;