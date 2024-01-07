// check - revisa por un campo en específico
// validationResult - Es el que va a guardar el resultado de la validación
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarJWT, generarId } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage('Ingrese un email válido').run(req);
    await check('password').notEmpty().withMessage('El Password es Obligatorio').run(req);

    const resultado = validationResult(req);

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: resultado.array()
        })
    }

    const { email, password } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{ msg: 'El Usuario no existe' }]
        });
    }

    // Confirmar si el usuario esta confirmado
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{ msg: 'Tu Cuenta no ha sido confirmada' }]
        });
    }

    // Revisar el Password
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{ msg: 'El Password es incorrecto' }]
        });
    }

    // Autenticar al Usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

    // console.log(token);

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true, // Esto hace que un cookie no sea accesible desde la api de JavaScript, desde la consola
        // secure: true, // Esto solo permite las cookies en conexiones seguras, con un certificado SSL.
        // sameSite: true
    }).redirect('/mis-propiedades');
}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
}

const formularioRegistro = (req, res) => {

    // la registra automáticamente en el req, es exclusiva de csrf

    // El primer parámetro es la view que quieres renderizar y el segundo es un objeto con la información que le quieres pasar a esa view (vista)
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('Ingresa un email valido').run(req);
    await check('password').isLength({ min: 6 }).withMessage('El Password debe ser de al menos 6 caracteres').run(req);
    await check('repetir_password').equals('password').withMessage('El Password no son iguales').run(req);

    let resultado = validationResult(req);

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            // utilizamos .array() para que lo convierta en un array
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body;

    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email } });
    
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{ msg: 'El usuario ya esta Registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // // crea un nuevo usuario con la información que le estamos pasando
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    // Envía email de confirmación, no le pasamos todo el usuario porque no necesitamos toda la información
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmación, presiona en el enlace'
    })

}


// Función que comprueba una cuenta
const confirmar = async (req, res /* next */) => { 
    // para acceder a las variables de la url, se usa req.params
    const { token } = req.params;

    // Verificar si el token es válido
    const usuario = await Usuario.findOne({where: {token}});

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: "Error al confirmar tu cuenta",
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save(); // método del ORM para guardar en la Base de Datos

    res.render('auth/confirmar-cuenta', {
        pagina: "Cuenta Confirmada",
        mensaje: 'La cuenta se confirmo Correctamente'
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raíces'
    })
}

const resetPassword = async (req, res) => {
    await check('email').isEmail().withMessage('Ingresa un Email valido').run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raíces',
            errores: resultado.array(),
        })
    }

    // Buscar al usuario
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    console.log(usuario);
    
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raíces',
            errores: [{msg: 'El email no pertenece a ningún Usuario'}],
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    // Renderizar un mensaje para decirle al usuario que debe seguir las instrucciones dadas para cambiar el password
    res.render('templates/mensaje', {
        pagina: "Restablece tu Password",
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Restablece tu Password'
    })
    

}

const nuevoPassword = async (req, res) => {
    // Validar el password
    await check('password').isLength(6).withMessage('El Password debe ser de al menos 6 caracteres').run(req);
    const resultado = validationResult(req);

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu Password',
            errores: resultado.array()
        })
    }

    const { token } = req.params;
    const { password } = req.body;
    
    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: { token } })
    
    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;
    usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'El Password se guardó correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}