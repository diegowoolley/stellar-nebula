import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { StatsController } from '../controllers/StatsController.js';

const router = Router();

// Rota para buscar métricas e dados de gráficos do Dashboard
router.get('/', authenticateUser, StatsController.getDashboardStats);

export default router;
