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

            // Verificar se o token consta no banco e está pendente
            const { data: linkData, error: linkError } = await supabase
                .from('external_request_links')
                .select('*')
                .eq('token', token)
                .single();

            if (linkError || !linkData) {
                throw new AppError('Link inválido ou não registrado.', 401);
            }

            if (linkData.status !== 'pending') {
                throw new AppError('Este link já foi utilizado.', 401);
            }

            if (new Date(linkData.expires_at) < new Date()) {
                throw new AppError('Este link expirou.', 401);
            }

            const { data, error } = await supabase.from('contractors').select('id, name').eq('id', decoded.contractorId).single();

            if (error || !data) throw new AppError('Contratante não encontrado', 404);
            res.json(data);
        } catch (err: any) {
            next(err instanceof AppError ? err : new AppError('Link expirado ou inválido.', 401));
        }
    }

    static async createEventRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = publicEventSchema.parse(req.body);
            const { token, ...eventData } = validatedData;

            const submission = {
                ...eventData,
                date: new Date(validatedData.date).toISOString(), // Normalizar data
                status: 'pending',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('events').insert(submission).select().single();
            if (error) throw new AppError(error.message, 400);

            // Se a solicitação foi criada com sucesso e havia um token, marcar o token como usado
            if (token) {
                console.log('Expirando token de uso único:', token);
                const { data: updateData, error: tokenError } = await supabase
                    .from('external_request_links')
                    .update({ status: 'used' })
                    .eq('token', token)
                    .select();

                if (tokenError) {
                    console.error('Erro ao expirar token:', tokenError);
                } else {
                    console.log('Token expirado com sucesso:', updateData);
                }
            } else {
                console.warn('createEventRequest chamado sem token.');
            }

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }
}
