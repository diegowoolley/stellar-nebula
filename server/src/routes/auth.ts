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

import { sendEmail } from '../utils/email.js';

// ... (imports remain the same)

// Rota para iniciar a Recuperação de Senha
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .single();

        if (error || !user) {
            // Retornamos sucesso mesmo se não encontrar para evitar enumeração de usuários
            return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
        }

        // Gera token JWT válido por 1 hora
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Link para o frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        // Envia o e-mail
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Olá, ${user.name || 'Usuário'}!</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no Stellar Nebula.</p>
                <p>Para criar uma nova senha, clique no botão abaixo:</p>
                <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
                <p>Ou copie e cole o link abaixo no seu navegador:</p>
                <p>${resetLink}</p>
                <p>Se você não solicitou isso, pode ignorar este e-mail. O link expira em 1 hora.</p>
            </div>
        `;

        await sendEmail(user.email, 'Redefinição de Senha - Stellar Nebula', html);

        res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
    } catch (err: any) {
        console.error('❌ ERRO CRÍTICO no forgot-password:', err);
        if (err instanceof Error) {
            console.error('Stack:', err.stack);
        }
        res.status(500).json({
            message: 'Erro ao processar solicitação.',
            error_details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Rota para completar a Redefinição de Senha
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        // Verifica o token JWT
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const email = decoded.email;

        // Gera novo hash para a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw error;

        res.json({ message: 'Sua senha foi alterada com sucesso!' });
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'O link de recuperação expirou. Solicite um novo.' });
        }
        res.status(400).json({ message: 'Link inválido ou erro ao atualizar senha.' });
    }
});

export default router;
