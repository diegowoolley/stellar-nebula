import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

// Rota de Registro de Usuário
router.post('/register', AuthController.register);

// Rota de Login
router.post('/login', AuthController.login);

// Rota para iniciar a Recuperação de Senha
router.post('/forgot-password', AuthController.forgotPassword);

// Rota para completar a Redefinição de Senha
router.post('/reset-password', AuthController.resetPassword);

export default router;
