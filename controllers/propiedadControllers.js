// paquete de nodeJS
import { unlink } from 'node:fs/promises';
import { validationResult } from 'express-validator';
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js';
import { esVendedor, formatearFecha } from '../helpers/index.js';

const admin = async (req, res) => {

    // no tienes que agregar una nueva ruta cuando agregues un QueryString
    // Para tener mas valores le pones &
    // QueryString - /propiedades?id=20&orden=DESC
    // Para acceder al QueryString se usa req.query
    
    // Leer QueryString
    const { pagina: paginaActual } = req.query;

    const expression = /^[1-9]$/;

    if (!expression.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1');
    }

    try {
        const { id } = req.usuario;

        // Paginador
        // Limites y Offset para el paginador
        const limit = 5;
        const offset = ((paginaActual * limit) - limit);

        const [ propiedades, total ] = await Promise.all([
            Propiedad.findAll({
                // Limite de registros que va a traer
                limit,
                // cuando este en la pagina 2 se salta los primeros números que le pongas al limit
                offset,
                where: {
                    usuarioId: id
                },
                // Cruzar con otro modelo que previamente ya este relacionado
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio'},
                    { model: Mensaje, as: 'mensajes'},
                ]
            }),
            // Para que cuente cuantas propiedades hay creadas por el usuario
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ]);

        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: +paginaActual,
            total,
            offset,
            limit
        });

    } catch (error) {
        console.log(error)
    }

}

// Formulario para crear una nueva propiedad
const crear = async (req, res) => {

    // Consultar Modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        // findAll() - es para que se traiga todos los registros de la BD.
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {

    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Crear un registro

    // Estoy renombrando categoria: categoriaId 
    const { titulo, description, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng } = req.body;

    const { id: usuarioId } = req.usuario;

    try {
        // Para guardar y cambiar el nombre de categoria a categoriaId.
        // Esta variable va a entregarnos una copia de lo que se esta enviando en la BD
        const propiedadGuardada = await Propiedad.create({
            titulo,
            description,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            categoriaId,
            precioId,
            usuarioId,
            imagen: ''
        });

        const { id } = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);
    } catch (error) {
        console.log("Error: ", error);
    }

}

const agregarImagen = async (req, res) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    // Si no existe la propiedad regresa a mis-propiedades
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no este publicada

    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página
    
    // Es buena idea convertirlos a string porque en algunas BD a los number los evalúa como objetos
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        propiedad
    });
}

const almacenarImagen = async (req, res, next) => {

    const { id } = req.params;

    
    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    
    // Validar que la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }
    
    // Validar que la propiedad pertenece a quien visita esta página.
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }
    
    try {        
        // req.file  - lo registra multer
        // console.log(req.file)

        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        // Para que avance al siguiente middleware
        next()

    } catch (error) {
        console.log(error)
    }

    // Esto no sirve porque dropzone envía el post al servidor y esto ya no funciona porque estamos enviando el post desde js
    // return res.redirect('/mis-propiedades');
}

const editar = async (req, res) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) return res.redirect('mis/propiedades');

    // Revisar que quien visita la url fue quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) return res.redirect('/mis-propiedades');

    // consultar Modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {
    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    const { id } = req.params;

     // Validar que la propiedad exista
     const propiedad = await Propiedad.findByPk(id);

     if (!propiedad) return res.redirect('mis/propiedades');
 
     // Revisar que quien visita la url fue quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) return res.redirect('/mis-propiedades');
    
    // Reescribir el objeto y actualizarlo

    try {
        const { titulo, description, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng } = req.body;

        // Reemplazar los valores de la base de datos
        propiedad.set({
            titulo,
            description,
            categoriaId,
            precioId,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng
        });

        await propiedad.save();

        res.redirect('/mis-propiedades');

    } catch (error) {
        console.log(error);
    }
}

const eliminar = async (req, res) => {
   
    const { id } = req.params;

     // Validar que la propiedad exista
     const propiedad = await Propiedad.findByPk(id);

     if (!propiedad) return res.redirect('mis/propiedades');
 
     // Revisar que quien visita la url fue quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) return res.redirect('/mis-propiedades');

    // Eliminar la imagen Asociada
    await unlink(`public/uploads/${propiedad.imagen}`);
    // console.log(`Se elimino la imagen: ${propiedad.imagen}`);
    
    // Eliminar la propiedad;
    await propiedad.destroy();

    res.redirect('/mis-propiedades');
}

// Modifica el estado de la propiedad
const cambiarEstado = async (req, res) => {
    
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) return res.redirect('mis/propiedades');

    // Revisar que quien visita la url fue quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) return res.redirect('/mis-propiedades');
    
    // Actualizar
    propiedad.publicado = !propiedad.publicado;

    await propiedad.save();

    res.json({
        resultado: true
    })
}

// Muestra una propiedad
const mostrarPropiedad = async (req, res) => {
    const { id } = req.params;

    
    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    });
    
    if (!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }

    // console.log(JSON.stringify(req.usuario, undefined, 2))

    // Opcional chaining (?) usuario?.id, le dice que puede existir o no, para que no marque error si no existe
    // console.log(esVendedor(req.usuario?.id, propiedad.usuarioId))
    
    res.render('propiedades/mostrar', {
        pagina: propiedad.titulo,
        propiedad,
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    });
}

const enviarMensaje = async (req, res) => {

    const { id } = req.params;
    
    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    });

    if (!propiedad) {
        return res.redirect('/404');
    }

    // Renderizar los errores
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('propiedades/mostrar', {
            pagina: propiedad.titulo,
            propiedad,
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array(),
        })
    }
    
    const { mensaje } = req.body;
    const { id: propiedadId } = req.params;
    const { id: usuarioId } = req.usuario;

    console.log(id)
    console.log(mensaje)
    console.log(usuarioId)

    // Almacenar el mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })


    res.render('propiedades/mostrar', {
        pagina: propiedad.titulo,
        propiedad,
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
    });

    res.redirect('/')
}

const verMensajes = async (req, res) => {
    
    const { id } = req.params;

    // Validar que solo el dueño de las propiedades pueda ver los mensajes

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            // Cruza Usuario con Mensaje
            {
                model: Mensaje, as: 'mensajes',
                include: [
                    // pasa solo la información que requerimos
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
        ]
    });
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que visita la URL, es quien creo la Propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
}