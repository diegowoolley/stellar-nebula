import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        const { email, password, name } = req.body;
        const normalizedEmail = email.toLowerCase();
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const { data, error } = await supabase
                .from('users')
                .insert([{ email: normalizedEmail, password: hashedPassword, name, role: 'user' }])
                .select();

            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data[0]);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        try {
            if (!JWT_SECRET) throw new AppError('JWT_SECRET is not defined in environment', 500);

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', normalizedEmail)
                .single();

            if (error || !user) {
                throw new AppError('Credenciais inválidas', 401);
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new AppError('Credenciais inválidas', 401);
            }

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

            const { password: _, ...userWithoutPassword } = user;
            res.json({ token, user: userWithoutPassword });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body;
        try {
            if (!JWT_SECRET) throw new AppError('JWT_SECRET is not defined in environment', 500);

            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, name')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/reset-password?token=${token}`;

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
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        const { token, newPassword } = req.body;
        try {
            if (!JWT_SECRET) throw new AppError('JWT_SECRET is not defined in environment', 500);

            const decoded = jwt.verify(token, JWT_SECRET) as any;
            const email = decoded.email;

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const { error } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('email', email);

            if (error) throw new AppError(error.message, 400);
            res.json({ message: 'Sua senha foi alterada com sucesso!' });
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return next(new AppError('O link de recuperação expirou. Solicite um novo.', 400));
            }
            next(new AppError('Link inválido ou erro ao atualizar senha.', 400));
        }
    }
}
