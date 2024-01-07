// Seeder - Es una formar de insertar datos masivamente en tu base de datos.

import { exit } from 'node:process';
// Los datos
import categorias from './categorias.js';
import precios from './precios.js';
import usuarios from './usuarios.js';
// El modelo que interactúa con la BD
// Este me importa las siguientes Relaciones
import { Categoria, Precio, Usuario } from '../models/index.js';
// y la instancia  de la base de datos
import db from '../config/db.js';

const importarDatos = async () => {
    try {

        // Quiero estar seguro de que me autentique y que todo este bien.
        // Autenticar en la BD
        await db.authenticate();

        // Generar las Columnas antes de insertarlas a la BD
        await db.sync();

        // Insertamos los datos
        // bulkCreate(datos) - Inserta todos los datos que se les pase
        // await Categoria.bulkCreate(categorias);
        // await Precio.bulkCreate(precios);
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ]);

        console.log('Datos importados correctamente');

        /* 
        Esto preguntan en una entrevista, porque le pasamos exit() o exit(1);

        exit(0) - Termina los procesos pero todo fue correcto
        exit(1) - Termina los procesos pero que hay un error
        */
        exit();

    } catch (error) {
        console.log(error);

        // Esto es una forma de terminar los procesos , si existe un error queremos terminarlo inmediatamente.
        // Como es un seeder y trabaja con la Base de datos le ponemos esto:
        // process.exit(1);
        exit(1); // Esta parte es importante
    }
}

const eliminarDatos = async () => {
    try {
        // await Promise.all([
        //     // destroy - se encarga de eliminar todos los registros
        //     // Esto limpia todas las categorías de la BD
        //     Categoria.destroy({ where: {}, truncate: true }),
        //     // truncate es para que reinicie el contador del id y no inicie en el ultimo id que estaba anteriormente
        //     Precio.destroy({ where: {}, truncate: true })
        // ]);

        // Limpia la BD
        await db.sync({force: true})
        
        console.log('Datos eliminados correctamente');
        exit();

    } catch (error) {
        console.log(error);
        exit(1);
    }
}

// .argv[] (argumentos) - Es algo interno de NodeJS. Es una forma en que le pasas argumentos a un comando desde el command line(terminal) y normalmente lo va a leer como si fuera un array
// En el package.json en las scripts se pasan a argv como si fueran una posicion de un array.
// "db:importar": "node ./seed/seeder.js -i"
// "db:importar": "node(0) ./seed/seeder.js(1) -i(2)"
// si le paso -i quiere decir que estoy importando
if (process.argv[2] === "-i") {
    importarDatos();
}

// -e de eliminar
if (process.argv[2] === "-e") {
    eliminarDatos();
}