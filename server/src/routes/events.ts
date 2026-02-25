import { Router } from 'express';
import { EventController } from '../controllers/EventController.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
import { supabase } from '../db.js';

const router = Router();

// Configuração do Multer para PDF
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos.'));
        }
    }
});

// BUSCAR lista de eventos pendentes
router.get('/pending', authenticateUser, EventController.getPendingEvents);

// BUSCAR contagem de eventos pendentes
router.get('/pending-count', authenticateUser, EventController.getPendingCount);

// BUSCAR todos os eventos
router.get('/', authenticateUser, EventController.getAllEvents);

// BUSCAR evento único por ID
router.get('/:id', authenticateUser, EventController.getEventById);

// CRIAR evento
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), EventController.createEvent);

// ATUALIZAR evento
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), EventController.updateEvent);

// DELETAR evento
router.delete('/:id', authenticateUser, authorizeRole(['admin']), EventController.deleteEvent);

// UPLOAD de contrato (PDF)
router.post('/upload-contract', authenticateUser, authorizeRole(['admin', 'producer']), upload.single('file'), EventController.uploadContract);

export default router;
