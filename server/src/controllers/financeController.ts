import type { Response } from 'express';
import { supabase } from '../db.js';
import type { AuthRequest } from '../middleware/auth.js';

export const financeController = {
    // Buscar estatísticas financeiras
    async getStats(req: AuthRequest, res: Response) {
        try {
            const { data: transactions, error } = await supabase
                .from('financial_transactions')
                .select('*');

            if (error) throw error;

            const stats = transactions.reduce((acc: any, curr: any) => {
                const amount = parseFloat(curr.amount);
                if (curr.type === 'entrada') {
                    acc.entradas += amount;
                } else {
                    acc.saidas += amount;
                }
                return acc;
            }, { entradas: 0, saidas: 0 });

            stats.saldo = stats.entradas - stats.saidas;

            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar transações
    async getTransactions(req: AuthRequest, res: Response) {
        try {
            const { data, error } = await supabase
                .from('financial_transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar nova transação
    async createTransaction(req: AuthRequest, res: Response) {
        try {
            const { type, amount, description, category, date } = req.body;
            const { data, error } = await supabase
                .from('financial_transactions')
                .insert([{ type, amount, description, category, date }])
                .select();

            if (error) throw error;
            res.status(201).json(data[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar nova assinatura e atualizar status do artista
    async createSubscription(req: AuthRequest, res: Response) {
        try {
            const { artist_id, plan_type, amount, start_date } = req.body;

            // Calcular end_date baseado no plano
            const start = new Date(start_date || new Date());
            const end = new Date(start);

            if (plan_type === 'mensal') end.setMonth(end.getMonth() + 1);
            if (plan_type === 'trimestral') end.setMonth(end.getMonth() + 3);
            if (plan_type === 'semestral') end.setMonth(end.getMonth() + 6);
            if (plan_type === 'anual') end.setFullYear(end.getFullYear() + 1);

            // Verificar se já existe uma assinatura ativa cobrindo este período
            const { data: existing, error: checkError } = await supabase
                .from('artist_subscriptions')
                .select('id, end_date')
                .eq('artist_id', artist_id)
                .eq('status', 'ativo')
                .gte('end_date', start.toISOString())
                .limit(1);

            if (checkError) throw checkError;
            if (existing && existing.length > 0) {
                return res.status(400).json({ error: 'Este artista já possui uma assinatura ativa no período escolhido.' });
            }

            // Inserir assinatura
            const { data: subData, error: subError } = await supabase
                .from('artist_subscriptions')
                .insert([{
                    artist_id,
                    plan_type,
                    amount,
                    start_date: start.toISOString(),
                    end_date: end.toISOString(),
                    status: 'ativo'
                }])
                .select();

            if (subError) throw subError;

            // Atualizar status do artista
            const { error: artError } = await supabase
                .from('artists')
                .update({
                    subscription_status: 'ativo',
                    subscription_expires_at: end.toISOString()
                })
                .eq('id', artist_id);

            if (artError) throw artError;

            // 4. Registrar automaticamente como uma Entrada Financeira
            const { data: artist } = await supabase
                .from('artists')
                .select('name')
                .eq('id', artist_id)
                .single();

            await supabase
                .from('financial_transactions')
                .insert([{
                    type: 'entrada',
                    amount,
                    description: `Assinatura ${plan_type} - ${artist?.name || 'Artista'}`,
                    category: 'Assinatura',
                    date: start.toISOString().split('T')[0]
                }]);

            res.status(201).json(subData[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar transação
    async updateTransaction(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { type, amount, description, category, date } = req.body;
            const { data, error } = await supabase
                .from('financial_transactions')
                .update({ type, amount, description, category, date })
                .eq('id', id)
                .select();

            if (error) throw error;
            res.json(data[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Excluir transação
    async deleteTransaction(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('financial_transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
