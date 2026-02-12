import { Router } from 'express';
import type { Response, Request } from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();

// LISTAR artistas (público) - para o contratante selecionar no formulário
router.get('/artists', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('artists').select('id, name').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// BUSCAR dados do contratante (público) - para validar o link e mostrar o nome
router.get('/contractor/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('contractors').select('id, name').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Contratante não encontrado' });
    res.json(data);
});

// VALIDAR TOKEN e retornar dados do contratante (Substitui o acesso direto por ID)
router.get('/validate-link/:token', async (req: Request, res: Response) => {
    const { token } = req.params;
    const secret = process.env.JWT_SECRET || 'secret_super_secreto_mudeme';

    try {
        const decoded = jwt.verify(token, secret) as { contractorId: string };

        // Se válido, buscar dados do contratante
        const { data, error } = await supabase.from('contractors').select('id, name').eq('id', decoded.contractorId).single();

        if (error || !data) return res.status(404).json({ error: 'Contratante não encontrado' });

        res.json(data);
    } catch (err) {
        return res.status(401).json({ error: 'Link expirado ou inválido.' });
    }
});

// CRIAR solicitação de evento (público)
router.post('/event', async (req: Request, res: Response) => {
    const eventData = req.body;

    // Forçar status como pending e garantir que campos básicos existem
    const submission = {
        ...eventData,
        status: 'pending',
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('events').insert(submission).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

export default router;
