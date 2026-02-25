import { Router } from 'express';
import { financeController } from '../controllers/financeController.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';

const router = Router();

// Todas as rotas financeiras exigem autenticação e cargo de admin
router.use(authenticateUser);
router.use(authorizeRole(['admin']));

router.get('/stats', financeController.getStats);
router.get('/transactions', financeController.getTransactions);
router.post('/transactions', financeController.createTransaction);
router.put('/transactions/:id', financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);
router.post('/subscriptions', financeController.createSubscription);

export default router;
