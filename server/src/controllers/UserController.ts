import type { Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcrypt';
import type { AuthRequest } from '../middleware/auth.js';

export class UserController {
    static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
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

            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, name, role, avatar_url, created_at')
                .eq('id', req.user.id)
                .single();

            if (error || !data) throw new AppError('Usuário não encontrado', 404);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { email, password, name, role, avatar_url } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData: any = {
                email,
                password: hashedPassword,
                name,
                role: role || 'viewer',
                avatar_url
            };

            let { data, error } = await supabase
                .from('users')
                .insert(userData)
                .select('id, email, name, role, avatar_url')
                .single();

            if (error && (error.message?.includes('column') || error.code === '42703')) {
                delete userData.avatar_url;
                const fallback: any = await supabase
                    .from('users')
                    .insert(userData)
                    .select('id, email, name, role')
                    .single();
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { email, name, role, password, avatar_url } = req.body;

            if (req.user.role !== 'admin' && req.user.id !== id) {
                throw new AppError('Acesso negado: você só pode atualizar seu próprio perfil', 403);
            }

            const updateData: any = { email, name, avatar_url };
            if (req.user.role === 'admin' && role) {
                updateData.role = role;
            }

            if (password && password.trim() !== '') {
                updateData.password = await bcrypt.hash(password, 10);
            }

            let { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select('id, email, name, role, avatar_url')
                .single();

            if (error && (error.message?.includes('column') || error.code === '42703')) {
                delete updateData.avatar_url;
                const fallback: any = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('id', id)
                    .select('id, email, name, role')
                    .single();
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw new AppError(error.message, 400);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (id === req.user.id) {
                throw new AppError('Você não pode excluir sua própria conta', 400);
            }

            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw new AppError(error.message, 400);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async uploadAvatar(req: any, res: Response, next: NextFunction) {
        try {
            if (!req.file) throw new AppError('Nenhum arquivo enviado', 400);

            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error } = await supabase.storage
                .from('images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (error) throw new AppError(error.message, 500);

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            res.json({ url: publicUrl });
        } catch (error) {
            next(error);
        }
    }
}
