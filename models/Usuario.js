import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

// Así se define un nuevo modelo, y recibe
// 1º nombre de la tabla
// 2º Objeto de configuración
const Usuario = db.define('usuarios', {
    nombre: {
        type: DataTypes.STRING, // tipo de datos
        allowNull: false // quiere decir que no puede ir vacío
    }, 
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
}, {
    // Aquí va a pasar el código que se ejecuta al hacer submit, y desde aquí se puede acceder antes de que se cree
    // Los hooks son funciones que pueden agregar a cierto modelo.
    hooks: {
        // El usuario se pasa en automático, o mejor dicho se pasa el req.body
        beforeCreate: async function (usuario) {
            // Este es el por default, mientras mas grande el número va a ser mas difícil descifrar el password. aunque mientras mas alto sea el número le va a costar mas al servidor.
            const salt = await bcrypt.genSalt(10);
            // Va a reescribir el password, y va ingresar el password hasheado
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    },
    // Los scopes sirven para eliminar ciertos campos cuando haces una consulta a un modelo en especifico.
    scopes: {
        eliminarPassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
});

// Métodos Personalizados
// Comprobar si es la misma password de la BD con la ingresada
// Crea un método para Usuario
Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}


export default Usuario;