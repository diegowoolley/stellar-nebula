import { Router } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
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
        }
        else {
            cb(new Error('Apenas arquivos PDF são permitidos.'));
        }
    }
});
// BUSCAR todos os eventos
router.get('/', authenticateUser, async (req, res) => {
    const { data, error } = await supabase
        .from('events')
        .select(`
      *,
      artists (name, logo_url),
      contractors (name)
    `)
        .order('date', { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
// CRIAR evento
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req, res) => {
    const { artist_id, contractor_id, city, state, date, type, status, event_name, venue_name, contract_url, details_contacts, details_suppliers, details_transports, details_lodging, details_lineup } = req.body;
    const { data, error } = await supabase
        .from('events')
        .insert({
        artist_id,
        contractor_id,
        city,
        state,
        date,
        type,
        status,
        event_name,
        venue_name,
        contract_url,
        details_contacts,
        details_suppliers,
        details_transports,
        details_lodging,
        details_lineup,
        created_by: req.user.id
    })
        .select()
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});
// ATUALIZAR evento
router.put('/:id', authenticateUser, authorizeRole(['admin', 'producer']), async (req, res) => {
    const { id } = req.params;
    const { updated_at, ...updates } = req.body;
    const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
});
// DELETAR evento
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(204).send();
});
// UPLOAD de contrato (PDF)
router.post('/upload-contract', authenticateUser, authorizeRole(['admin', 'producer']), upload.single('file'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const file = req.file;
    const fileName = `contract-${Math.random().toString(36).substring(2)}-${Date.now()}.pdf`;
    const filePath = `contracts/${fileName}`;
    try {
        // Garantir que o bucket existe
        await supabase.storage.createBucket('event-contracts', { public: true });
        const { data, error } = await supabase.storage
            .from('event-contracts')
            .upload(filePath, file.buffer, {
            contentType: 'application/pdf',
            upsert: true
        });
        if (error)
            throw error;
        const { data: { publicUrl } } = supabase.storage
            .from('event-contracts')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Erro no upload do contrato.' });
    }
});
export default router;
//# sourceMappingURL=events.js.map