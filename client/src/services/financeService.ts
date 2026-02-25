import api from './api';

export interface FinancialStats {
    entradas: number;
    saidas: number;
    saldo: number;
}

export interface Transaction {
    id: string;
    type: 'entrada' | 'saida';
    amount: number;
    description: string;
    category: string;
    date: string;
    created_at: string;
}

export interface Subscription {
    id: string;
    artist_id: string;
    plan_type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    amount: number;
    start_date: string;
    end_date: string;
    status: 'ativo' | 'pendente' | 'cancelado' | 'expirado';
}

export const financeService = {
    async getStats(): Promise<FinancialStats> {
        const response = await api.get('/finance/stats');
        return response.data;
    },

    async getTransactions(): Promise<Transaction[]> {
        const response = await api.get('/finance/transactions');
        return response.data;
    },

    async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const response = await api.post('/finance/transactions', transaction);
        return response.data;
    },

    async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
        const response = await api.put(`/finance/transactions/${id}`, transaction);
        return response.data;
    },

    async deleteTransaction(id: string): Promise<void> {
        await api.delete(`/finance/transactions/${id}`);
    },

    async createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
        const response = await api.post('/finance/subscriptions', subscription);
        return response.data;
    }
};
