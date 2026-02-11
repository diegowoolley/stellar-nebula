import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Rota de Registro de Usuário
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name, role: 'user' }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Rota de Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Busca o usuário pelo e-mail
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        // Compara a senha enviada com o hash no banco
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Senha inválida' });
        }

        // Gera o token JWT para sessões autenticadas
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        // Remove a senha do objeto de retorno por segurança
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para iniciar a Recuperação de Senha
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'Usuário não encontrado com este e-mail.' });
        }

        // Simulação de Token (Email em Base64 para desenvolvimento)
        const token = Buffer.from(email).toString('base64');

        res.json({
            message: 'E-mail de recuperação enviado com sucesso!',
            debugToken: token // Apenas para facilitar testes em dev
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
});

// Rota para completar a Redefinição de Senha
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        // Decodifica o token para obter o e-mail (simulado)
        const email = Buffer.from(token, 'base64').toString('ascii');

        // Gera novo hash para a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw error;

        res.json({ message: 'Sua senha foi alterada com sucesso!' });
    } catch (err: any) {
        res.status(500).json({ message: 'Token inválido ou erro ao atualizar senha.' });
    }
});

export default router;
