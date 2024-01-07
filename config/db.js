import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Toma 4 parámetros
// 1º nombre de la BD
// 2º Usuario
// 3º Password
// 4º Objeto de configuración para pasarle mas opciones
const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS ?? '', {
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql', /* base de Datos */
    define: {
        // lo que hace es que cuando un usuario se registra agrega 2 columnas extras a la tabla de usuarios, una va a tener cuando fue creado ese usuario o tabla de registro, y el otro va a ser cuando fue actualizado
        timestamps: true
    },
    // configura como va a ser el comportamiento para conexiones nuevas o existentes. Lo que va a ser mysql es mantener las conexiones que estén vivas se sigan utilizando y no se cree una nueva.
    pool: {
        max: 5, // máximo de conexiones a mantener
        min: 0, // mínimo de conexiones a mantener
        acquire: 30000, // son milisegundos, o sea 30s .- es el tiempo que va a pasar tratando de elaborar una conexión antes de marcar un error
        idle: 10000 // 10s - si nadie esta usando la conexión le da 10s para que se finalice la conexión.
    },
    // Estos ya están obsoletos por eso nos aseguramos que no utilice operatorAliases.
    operatorAliases: false
});



export default db;