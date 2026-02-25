import type { Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticatedEventSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export class EventController {
    static async getPendingEvents(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    id,
                    event_name,
                    date,
                    status,
                    artists (name),
                    contractors (name)
                `)
                .eq('status', 'pending')
                .order('date', { ascending: true })
                .limit(10);

            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async getPendingCount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { count, error } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (error) throw new AppError(error.message, 500);
            res.json({ count });
        } catch (error) {
            next(error);
        }
    }

    static async getAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    artists (name, logo_url),
                    contractors (name)
                `)
                .order('date', { ascending: true });

            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    artists (name, logo_url),
                    contractors (name)
                `)
                .eq('id', req.params.id)
                .single();

            if (error) throw new AppError('Evento não encontrado', 404);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const validatedData = authenticatedEventSchema.parse(req.body);
            const {
                artist_id, contractor_id, city, state, date, type, status,
                event_name, venue_name, contract_url,
                details_contacts, details_suppliers, details_transports,
                details_lodging, details_lineup
            } = validatedData;

            const { data, error } = await supabase
                .from('events')
                .insert({
                    artist_id,
                    contractor_id,
                    city,
                    state,
                    date,
                    type,
                    status,
                    event_name,
                    venue_name,
                    contract_url,
                    details_contacts,
                    details_suppliers,
                    details_transports,
                    details_lodging,
                    details_lineup,
                    created_by: req.user.id
                })
                .select()
                .single();

            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    static async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { updated_at, ...updates } = req.body;
            const { data, error } = await supabase
                .from('events')
                .update({ ...updates, updated_at: new Date() })
                .eq('id', req.params.id)
                .select()
                .single();

            if (error) throw new AppError(error.message, 400);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { error } = await supabase.from('events').delete().eq('id', req.params.id);
            if (error) throw new AppError(error.message, 400);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async uploadContract(req: any, res: Response, next: NextFunction) {
        if (!req.file) return next(new AppError('Nenhum arquivo enviado.', 400));

        const file = req.file;
        const fileName = `contract-${Math.random().toString(36).substring(2)}-${Date.now()}.pdf`;
        const filePath = `contracts/${fileName}`;

        try {
            // Ensure bucket exists (optional if already created)
            await supabase.storage.createBucket('event-contracts', { public: true });

            const { error } = await supabase.storage
                .from('event-contracts')
                .upload(filePath, file.buffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) throw new AppError(error.message, 500);

            const { data: { publicUrl } } = supabase.storage
                .from('event-contracts')
                .getPublicUrl(filePath);

            res.json({ url: publicUrl });
        } catch (error) {
            next(error);
        }
    }
}
