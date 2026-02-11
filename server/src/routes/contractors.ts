import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// LISTAR todos os contratantes (Ordenado por nome)
router.get('/', authenticateUser, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('contractors').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CRIAR um novo contratante
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const { name, contact_email, phone } = req.body;
    const { data, error } = await supabase.from('contractors').insert({ name, contact_email, phone }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// ATUALIZAR dados de um contratante existente
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const updates = req.body;
    const { data, error } = await supabase
        .from('contractors')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// DELETAR um contratante (Apenas administradores)
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { error } = await supabase.from('contractors').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
});

export default router;
