import { Router } from 'express';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import { ContractorController } from '../controllers/ContractorController.js';

const router = Router();

// LISTAR todos os contratantes
router.get('/', authenticateUser, ContractorController.getAllContractors);

// CRIAR um novo contratante
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), ContractorController.createContractor);

// ATUALIZAR dados de um contratante existente
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), ContractorController.updateContractor);

// DELETAR um contratante
router.delete('/:id', authenticateUser, authorizeRole(['admin']), ContractorController.deleteContractor);

// GERAR LINK com token
router.post('/:id/link', ContractorController.generateLink);

export default router;
