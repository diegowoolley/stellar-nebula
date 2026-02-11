import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../db.js';
import { z } from 'zod';
const router = Router();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
// Registrar (Para configuração inicial ou admin criando usuários)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        // Verifica se o usuário já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (existingUser) {
            res.status(400).json({ message: 'Usuário já existe' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert({
            email,
            password: hashedPassword,
            name,
            role: role || 'viewer'
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({ message: 'Usuário criado', user: { id: data.id, email: data.email, role: data.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Em uma app real, definir cookie aqui se usar HttpOnly
        // res.cookie('token', token, { httpOnly: true, secure: true });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(400).json({ message: 'Falha no login', error });
    }
});
export default router;
//# sourceMappingURL=auth.js.map