import { Router } from 'express';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
const router = Router();
// LISTAR todos os contratantes
router.get('/', authenticateUser, async (req, res) => {
    const { data, error } = await supabase.from('contractors').select('*').order('name');
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
// CRIAR contratante
router.post('/', authenticateUser, authorizeRole(['admin', 'producer']), async (req, res) => {
    const { name, phone, email } = req.body;
    const { data, error } = await supabase.from('contractors').insert({ name, phone, email }).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});
export default router;
//# sourceMappingURL=contractors.js.map