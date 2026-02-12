import { Router } from 'express';
import type { Response, Request } from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';
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

// GERAR LINK com token (JWT 24h)
router.post('/:id/link', async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    // Verificar se contratante existe
    const { data, error } = await supabase.from('contractors').select('id, name').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Contratante não encontrado' });

    // Gerar token
    const secret = process.env.JWT_SECRET || 'secret_super_secreto_mudeme';
    const token = jwt.sign({ contractorId: id }, secret, { expiresIn: '24h' });

    // Retornar link frontal (opcional, pode retornar só o token)
    // Front deve montar: origin + /external-request/ + token
    res.json({ token });
});

export default router;
