import type { Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export class ArtistController {
    static async getAllArtists(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { data, error } = await supabase.from('artists').select('*').order('name');
            if (error) throw new AppError(error.message, 500);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    static async createArtist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, logo_url } = req.body;
            const { data, error } = await supabase.from('artists').insert({ name, logo_url }).select().single();
            if (error) throw new AppError(error.message, 400);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    static async updateArtist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const updates = req.body;
            const { data, error } = await supabase
                .from('artists')
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

    static async deleteArtist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { error } = await supabase.from('artists').delete().eq('id', req.params.id);
            if (error) throw new AppError(error.message, 400);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async uploadLogo(req: any, res: Response, next: NextFunction) {
        try {
            if (!req.file) throw new AppError('Nenhum arquivo enviado', 400);

            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

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
