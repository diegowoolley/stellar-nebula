import { Router } from 'express';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import { UserController } from '../controllers/UserController.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

const router = Router();

// LISTAR todos os usuários
router.get('/', authenticateUser, authorizeRole(['admin']), UserController.getAllUsers);

// OBTER dados do próprio usuário
router.get('/me', authenticateUser, UserController.getMe);

// CRIAR usuário
router.post('/', authenticateUser, authorizeRole(['admin']), UserController.createUser);

// ATUALIZAR usuário
router.put('/:id', authenticateUser, UserController.updateUser);

// EXCLUIR usuário
router.delete('/:id', authenticateUser, authorizeRole(['admin']), UserController.deleteUser);

// UPLOAD de avatar
router.post('/upload-avatar', authenticateUser, upload.single('file'), UserController.uploadAvatar);

export default router;
