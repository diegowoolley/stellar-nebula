import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class ContractorController {
    static async getAllContractors(req: Request, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase.from('contractors').select('*').order('name');
            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async createContractor(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, contact_email, phone } = req.body;
            const { data, error } = await supabase.from('contractors').insert({ name, contact_email, phone }).select().single();
            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    static async updateContractor(req: Request, res: Response, next: NextFunction) {
        try {
            const updates = req.body;
            const { data, error } = await supabase
                .from('contractors')
                .update(updates)
                .eq('id', req.params.id)
                .select()
                .single();

            if (error) throw new AppError(error.message, 400);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async deleteContractor(req: Request, res: Response, next: NextFunction) {
        try {
            const { error } = await supabase.from('contractors').delete().eq('id', req.params.id);
            if (error) throw new AppError(error.message, 400);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async generateLink(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!JWT_SECRET) throw new AppError('JWT_SECRET não configurado', 500);

            const { data, error } = await supabase.from('contractors').select('id, name').eq('id', id).single();
            if (error || !data) throw new AppError('Contratante não encontrado', 404);

            const token = jwt.sign({ contractorId: id }, JWT_SECRET, { expiresIn: '24h' });

            // Armazenar o token no banco para controle de uso único
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            const { error: linkError } = await supabase
                .from('external_request_links')
                .insert({
                    contractor_id: id,
                    token,
                    status: 'pending',
                    expires_at: expiresAt.toISOString()
                });

            if (linkError) {
                console.error('Erro ao registrar link:', linkError);
                // Não travamos o processo aqui, mas o controle de uso único pode falhar se o insert falhar
            }

            res.json({ token });
        } catch (error) {
            next(error);
        }
    }
}
