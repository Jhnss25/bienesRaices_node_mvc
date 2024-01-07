import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const identificarUsuario = async (req, res, next) => {

    // Identificar si hay un token
    const { _token } = req.cookies;
    
    // si no tiene el _token es que no tiene cuenta o no ha iniciado sesión
    if (!_token) {
        req.usuario = null;
        return next()
    }
    
    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);

        if (usuario) {
            req.usuario = usuario;
        }

        return next();

    } catch (error) {
        console.log(error)
        // limpiamos el cookie porque ya no sirve
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default identificarUsuario;