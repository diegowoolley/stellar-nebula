import { Router } from 'express';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import { ArtistController } from '../controllers/ArtistController.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

const router = Router();

// LISTAR todos os artistas
router.get('/', authenticateUser, ArtistController.getAllArtists);

// CRIAR um novo artista
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), ArtistController.createArtist);

// ATUALIZAR dados de um artista existente
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), ArtistController.updateArtist);

// DELETAR um artista
router.delete('/:id', authenticateUser, authorizeRole(['admin']), ArtistController.deleteArtist);

// UPLOAD de logo de artista
router.post('/upload-logo', authenticateUser, upload.single('file'), ArtistController.uploadLogo);

export default router;
