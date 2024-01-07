import express from 'express';
import helmet from 'helmet';
import csrf from 'csrf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';

// Crear la app
const app = express();

// Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

// Habilitar Cookie Parser
app.use(cookieParser());

// Habilitar CSRF
// Al configurarlo de esta forma lo habilitamos de forma global en nuestra aplicación.
// app.use(helmet());

const tokens = new csrf();

// Middleware para agregar el token CSRF a las vistas
app.use((req, res, next) => {
    const secret = tokens.secretSync(); // Reemplaza con tu propia clave secreta
    const token = tokens.create(secret);
    res.locals.csrfToken = token;
    next();
});
  

// Conexión a la base de datos
try {
    // Este es un método de Sequelize para autenticar si esta OK.
    await db.authenticate();
    // Verifica si la conexión a la base de datos está funcionando
    db.sync();
    // este sync crea la tabla de BD si no esta creada
    console.log('Conexión correcta a la base de datos')
} catch (error) {
    console.error(error)
}

// Habilitar pug
// .set() es para agregar configuración
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta Pública - es donde se almacena los archivos estáticos
app.use( express.static('public'))


// Routing
app.use('/', appRoutes)

// .use() - busca todas la rutas que inicien con el valor definido en este caso '/'.
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);

app.use('/api', apiRoutes)



// Definir un puerto y arrancarlo
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El Servidor esta funcionando en el puerto ${port}`);
})