import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();

// Configuração do Multer (armazenamento em memória para repasse ao Supabase)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por arquivo
    }
});

// LISTAR todos os artistas (Ordenado por nome)
router.get('/', authenticateUser, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('artists').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CRIAR um novo artista
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const { name, logo_url } = req.body;
    const { data, error } = await supabase.from('artists').insert({ name, logo_url }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// ATUALIZAR dados de um artista existente
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), async (req: AuthRequest, res: Response) => {
    const { name, logo_url } = req.body;
    const { data, error } = await supabase
        .from('artists')
        .update({ name, logo_url })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// DELETAR um artista (Apenas administradores)
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { error } = await supabase.from('artists').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
});

// UPLOAD de logo/foto do artista para o Supabase Storage
router.post('/upload', authenticateUser, authorizeRole(['admin', 'producer']), upload.single('file'), async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    try {
        // Garante a existência do bucket no Supabase
        await supabase.storage.createBucket('artist-logos', { public: true });

        const { data, error } = await supabase.storage
            .from('artist-logos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Obtém a URL pública da imagem salva
        const { data: { publicUrl } } = supabase.storage
            .from('artist-logos')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao realizar upload para o Supabase Storage' });
    }
});

export default router;
