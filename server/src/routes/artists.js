import { Router } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
const router = Router();
// Configuração do Multer (em memória para repassar ao Supabase)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
// LISTAR todos os artistas
router.get('/', authenticateUser, async (req, res) => {
    const { data, error } = await supabase.from('artists').select('*').order('name');
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
// CRIAR artista
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req, res) => {
    const { name, logo_url } = req.body;
    const { data, error } = await supabase.from('artists').insert({ name, logo_url }).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});
// ATUALIZAR artista
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), async (req, res) => {
    const { name, logo_url } = req.body;
    const { data, error } = await supabase
        .from('artists')
        .update({ name, logo_url })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
});
// DELETAR artista
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    const { error } = await supabase.from('artists').delete().eq('id', req.params.id);
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(204).send();
});
// UPLOAD de foto
router.post('/upload', authenticateUser, authorizeRole(['admin', 'producer']), upload.single('file'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    try {
        // Garantir que o bucket existe (Supabase ignora se já existir)
        await supabase.storage.createBucket('artist-logos', { public: true });
        const { data, error } = await supabase.storage
            .from('artist-logos')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (error)
            throw error;
        // Pegar URL Pública
        const { data: { publicUrl } } = supabase.storage
            .from('artist-logos')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Erro no upload para o Supabase Storage' });
    }
});
export default router;
//# sourceMappingURL=artists.js.map