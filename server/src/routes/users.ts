import { Router } from 'express';
import type { Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../db.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

const router = Router();

// LISTAR todos os usuários (apenas admin)
router.get('/', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    // Tentamos selecionar com avatar_url, se falhar tentamos sem (visto que a coluna é nova)
    let { data, error }: any = await supabase
        .from('users')
        .select('id, email, name, role, avatar_url, created_at')
        .order('name');

    if (error && (error.message?.includes('column') || error.code === '42703')) {
        const fallback = await supabase
            .from('users')
            .select('id, email, name, role, created_at')
            .order('name');
        data = fallback.data;
        error = fallback.error;
    }

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// OBTER dados do próprio usuário logado
router.get('/me', authenticateUser, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, avatar_url, created_at')
        .eq('id', req.user.id)
        .single();

    if (error) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(data);
});

// CRIAR usuário (apenas admin)
router.post('/', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { email, password, name, role, avatar_url } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData: any = {
            email,
            password: hashedPassword,
            name,
            role: role || 'viewer',
            avatar_url
        };

        const { data, error } = await supabase
            .from('users')
            .insert(userData)
            .select('id, email, name, role, avatar_url')
            .single();

        if (error && (error.message?.includes('column') || error.code === '42703')) {
            delete userData.avatar_url;
            const fallback = await supabase
                .from('users')
                .insert(userData)
                .select('id, email, name, role')
                .single();
            if (fallback.error) return res.status(400).json({ error: fallback.error.message });
            return res.status(201).json(fallback.data);
        }

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// ATUALIZAR usuário (admin ou o próprio usuário)
router.put('/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { email, name, role, password, avatar_url } = req.body;

    // Verificar permissão: admin OU o próprio usuário
    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ error: 'Acesso negado: você só pode atualizar seu próprio perfil' });
    }

    try {
        const updateData: any = { email, name, avatar_url };

        // Apenas admin pode alterar a função (role)
        if (req.user.role === 'admin' && role) {
            updateData.role = role;
        }

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, email, name, role, avatar_url')
            .single();

        if (error && (error.message?.includes('column') || error.code === '42703')) {
            delete updateData.avatar_url;
            const fallback = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select('id, email, name, role')
                .single();
            if (fallback.error) return res.status(400).json({ error: fallback.error.message });
            return res.json(fallback.data);
        }

        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// EXCLUIR usuário (apenas admin)
router.delete('/:id', authenticateUser, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Não permitir que o usuário exclua a si mesmo
    if (id === req.user.id) {
        return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
});

// UPLOAD de avatar
router.post('/upload-avatar', authenticateUser, upload.single('file'), async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Diagnóstico de Storage
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) console.error('Error listing buckets:', bucketError);
    else console.log('Available buckets:', buckets.map(b => b.name));

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });

    if (error) return res.status(500).json({ error: error.message });

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    res.json({ url: publicUrl });
});

export default router;
