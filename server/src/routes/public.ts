import { Router } from 'express';
import { PublicController } from '../controllers/PublicController.js';

const router = Router();

// LISTAR artistas (público)
router.get('/artists', PublicController.getArtists);

// BUSCAR dados do contratante (público)
router.get('/contractor/:id', PublicController.getContractor);

// VALIDAR TOKEN e retornar dados do contratante
router.get('/validate-link/:token', PublicController.validateLink);

// CRIAR solicitação de evento (público)
router.post('/event', PublicController.createEventRequest);

export default router;
