import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// LISTAR todos os contratantes
router.get('/', authenticateUser, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('contractors').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CRIAR contratante
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const { name, phone, email } = req.body;
    const { data, error } = await supabase.from('contractors').insert({ name, phone, email }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// ATUALIZAR contratante
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    const { data, error } = await supabase.from('contractors').update({ name, phone, email }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// EXCLUIR contratante
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from('contractors').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
});

export default router;
