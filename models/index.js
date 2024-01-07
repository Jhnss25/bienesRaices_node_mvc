// Este archivo lo que va hacer es importar los demás modelos
import Propiedad from './Propiedad.js';
import Precio from './Precio.js';
import Categoria from './Categoria.js';
import Usuario from './Usuario.js';
import Mensaje from './Mensaje.js';

// Precio.hasOne(Propiedad); // Este se lee de derecha a izquierda, "Propiedad tiene un precio"

// Relación 1:1
Propiedad.belongsTo(Precio, { foreignKey: 'precioId' });
Propiedad.belongsTo(Categoria, { foreignKey: 'categoriaId' });
Propiedad.belongsTo(Usuario, { foreignKey: 'usuarioId' });
// una propiedad puede tener multiples mensajes
Propiedad.hasMany(Mensaje, { foreignKey: 'propiedadId' });

Mensaje.belongsTo(Propiedad, { foreignKey: 'propiedadId' });
Mensaje.belongsTo(Usuario, { foreignKey: 'usuarioId' });

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}