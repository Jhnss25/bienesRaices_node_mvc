import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const protegerRuta = async (req, res, next) => {
    
    // Verificar si hay un token
    // Extraer el jsonWebToken
    const { _token } = req.cookies;
    if (!_token) {
        return res.redirect('/auth/login');
    }

    // Comprobar el token
    try {

        // Debe ser la misma palabra secreta que usaste para crea el jwt
        // .verify() - Que sea un token valido, que no haya expirado, todo eso lo comprueba
        const decode = jwt.verify(_token, process.env.JWT_SECRET);

        // .findByPk() - Busca en la base de datos por la primary Key.
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decode.id);

        if (usuario) {
            // lo agrego al req este objeto que estamos obteniendo de la BD, y va a estar disponible donde usemos el req y res, por eso lo estamos colocando para que este disponible en otro req de otro archivo
            req.usuario = usuario;
        } else {
            return res.redirect('/auth/login');
        }
        
        // Es para que avance al siguiente Middleware
        return next();

    } catch (error) {
        // Limpiar el _token
        return res.clearCookie('_token').redirect('/auth/login');
    }
}

export default protegerRuta;