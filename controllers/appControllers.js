import { Sequelize } from 'sequelize';
import { Precio, Categoria, Propiedad } from '../models/index.js';

const inicio = async (req, res) => {

    const [ categorias, precios, casas, departamentos ] = await Promise.all([
        // Pasa solo el valor de la tabla de la BD
        Categoria.findAll({raw: true}),
        Precio.findAll({ raw: true }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 2
            },
            include: [
                {
                    model: Precio, as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
    ])

    // console.log(casas, departamentos)

    res.render('inicio', {
        pagina: 'Inicio',
        categorias,
        precios,
        casas,
        departamentos
    })
}

const categoria = async (req, res) => {

    const { id } = req.params;

    // Comprobar que la categoría exista
    const categoria = await Categoria.findByPk(id);

    if (!categoria || isNaN(+id) || !(id >= 1 && id <= 5 )) {
        return res.redirect('/404');
    }

    
    // Obtener las propiedades de Categoría
    const propiedades = await Propiedad.findAll({
        where: {
            categoriaId: id
        },
        include: [
            { model: Precio, as: 'precio' }
        ]
    });

    res.render('categoria', {
        pagina: `${categoria.nombre}s en venta`,
        propiedades
    })

}

const noEncontrado = (req, res) => {
    res.render('404', {
        pagina: 'No Encontrada'
    })
}

const buscador = async (req, res) => {
    const { termino } = req.body;

    // Validar que termino no este vacío
    if (!termino.trim()) {
        // Vuelve a la última pagina visitada
        return res.redirect('back');
    }

    const propiedades = await Propiedad.findAll({
        where: {
            titulo: {
                // Busca en cualquier lugar dentro de la cadena titulo, % hace que busques al inicio y al final de la cadena
                [Sequelize.Op.like] : "%" + termino + "%"
            }
        },
        include: [
            {model: Precio, as: 'precio'}
        ]
    })

    res.render('busqueda', {
        pagina: 'Resultados de la Búsqueda',
        propiedades
    })
}


export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}