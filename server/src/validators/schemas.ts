import { z } from 'zod';

export const publicEventSchema = z.object({
    artist_id: z.string().uuid('ID do artista inválido'),
    contractor_id: z.string().uuid('ID do contratante inválido'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().min(2, 'UF é obrigatória').max(2),
    date: z.string().refine((val) => {
        const date = new Date(val);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return !isNaN(date.getTime()) && date >= now;
    }, {
        message: 'A data do evento não pode ser no passado'
    }),
    type: z.enum(['show', 'corporativo', 'outros', 'event']).optional(),
    event_name: z.string().min(3, 'Nome do evento é obrigatório (mín. 3 caracteres)'),
    venue_name: z.string().min(2, 'Local do evento é obrigatório'),
    details_contacts: z.record(z.string(), z.any()).optional().nullable(),
    details_suppliers: z.record(z.string(), z.any()).optional().nullable(),
    details_transports: z.record(z.string(), z.any()).optional().nullable(),
    details_lodging: z.record(z.string(), z.any()).optional().nullable(),
    details_lineup: z.record(z.string(), z.any()).optional().nullable()
}).passthrough();

export const authenticatedEventSchema = publicEventSchema.extend({
    status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    contract_url: z.string().url('URL do contrato inválida').optional().or(z.literal(''))
});

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

export const registerSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    name: z.string().min(2, 'Nome é obrigatório')
});
