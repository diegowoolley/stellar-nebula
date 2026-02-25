import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import jwt from 'jsonwebtoken';
import { publicEventSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

export class PublicController {
    static async getArtists(req: Request, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase.from('artists').select('id, name').order('name');
            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async getContractor(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { data, error } = await supabase.from('contractors').select('id, name').eq('id', id).single();
            if (error || !data) throw new AppError('Contratante não encontrado', 404);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async validateLink(req: Request<{ token: string }>, res: Response, next: NextFunction) {
        const { token } = req.params;
        const secret = process.env.JWT_SECRET;

        if (!secret) return next(new AppError('JWT_SECRET não configurado', 500));

        try {
            const decoded = jwt.verify(token, secret) as unknown as { contractorId: string };
            const { data, error } = await supabase.from('contractors').select('id, name').eq('id', decoded.contractorId).single();

            if (error || !data) throw new AppError('Contratante não encontrado', 404);
            res.json(data);
        } catch (err: any) {
            next(new AppError('Link expirado ou inválido.', 401));
        }
    }

    static async createEventRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = publicEventSchema.parse(req.body);

            const submission = {
                ...validatedData,
                status: 'pending',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('events').insert(submission).select().single();
            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }
}
