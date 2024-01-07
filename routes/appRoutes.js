// Rutas de uso general

import express from 'express';
import { inicio, categoria, noEncontrado, buscador } from '../controllers/appControllers.js';

const router = express.Router();

// Página de Inicio
router.get('/', inicio);

// Categorias
router.get('/categoria/:id', categoria)

// Página 404
router.get('/404', noEncontrado)

// Buscador
router.post('/buscador', buscador)

export default router;