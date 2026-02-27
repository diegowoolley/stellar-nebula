import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle,
    Plus,
    Calendar,
    CreditCard,
    TrendingUp,
    TrendingDown,
    X,
    Edit2,
    Trash2
} from 'lucide-react';
import { financeService } from '../services/financeService';
import type { FinancialStats, Transaction } from '../services/financeService';
import api from '../services/api';
import { format } from 'date-fns';
import clsx from 'clsx';
import { maskCurrency, parseCurrencyToNumber } from '../utils/format';

export const Finance = () => {
    const [stats, setStats] = useState<FinancialStats>({ entradas: 0, saidas: 0, saldo: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
    const [categoryFilter, setCategoryFilter] = useState('todos');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form states
    const [newTransaction, setNewTransaction] = useState({
        type: 'entrada',
        amount: '',
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [newSubscription, setNewSubscription] = useState({
        artist_id: '',
        plan_type: 'mensal',
        amount: '',
        start_date: format(new Date(), 'yyyy-MM-dd')
    });

    const resetTransactionForm = () => {
        setNewTransaction({
            type: 'entrada',
            amount: '',
            description: '',
            category: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const resetSubscriptionForm = () => {
        setNewSubscription({
            artist_id: '',
            plan_type: 'mensal',
            amount: '',
            start_date: format(new Date(), 'yyyy-MM-dd')
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, transData, artistsData] = await Promise.all([
                financeService.getStats(),
                financeService.getTransactions(),
                api.get('/artists')
            ]);
            setStats(statsData);
            setTransactions(transData);
            setArtists(artistsData.data);
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await financeService.updateTransaction(editingTransaction, {
                    ...newTransaction,
                    amount: parseCurrencyToNumber(newTransaction.amount),
                    type: newTransaction.type as 'entrada' | 'saida'
                });
            } else {
                await financeService.createTransaction({
                    ...newTransaction,
                    amount: parseCurrencyToNumber(newTransaction.amount),
                    type: newTransaction.type as 'entrada' | 'saida'
                });
            }
            setShowTransactionModal(false);
            resetTransactionForm();
            setEditingTransaction(null);
            loadData();
        } catch (error) {
            alert('Erro ao salvar transação');
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        try {
            await financeService.deleteTransaction(id);
            //alert('Transação excluída com sucesso!');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir transação');
        }
    };

    const handleEditTransaction = (t: Transaction) => {
        setEditingTransaction(t.id);
        setNewTransaction({
            type: t.type,
            amount: maskCurrency(t.amount * 100), // maskCurrency expects raw value for /100
            description: t.description,
            category: t.category,
            date: format(new Date(t.date), 'yyyy-MM-dd')
        });
        setShowTransactionModal(true);
    };

    const handleCreateSubscription = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await financeService.createSubscription({
                ...newSubscription,
                amount: parseCurrencyToNumber(newSubscription.amount),
                plan_type: newSubscription.plan_type as 'mensal' | 'trimestral' | 'semestral' | 'anual'
            });
            setShowSubscriptionModal(false);
            resetSubscriptionForm();
            loadData();
        } catch (error: any) {
            console.error('Erro ao criar assinatura:', error);
            alert(error.response?.data?.error || 'Erro ao criar assinatura');
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'todos' || t.type === typeFilter;
        const matchesCategory = categoryFilter === 'todos' || t.category === categoryFilter;

        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && new Date(t.date) >= new Date(startDate);
        }
        if (endDate) {
            matchesDate = matchesDate && new Date(t.date) <= new Date(endDate);
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
    });

    const getAvailableCategories = () => {
        const uniqueCategories = new Set(
            transactions
                .filter(t => t.type === newTransaction.type && t.category)
                .map(t => t.category)
        );
        return Array.from(uniqueCategories);
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-[var(--text-main)]">Carregando...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-[var(--text-main)]">Financeiro</h1>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowTransactionModal(true)}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
                    >
                        <Plus size={18} className="mr-2" />
                        Nova Transação
                    </button>
                    <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="flex items-center px-4 py-2 bg-[var(--bg-sidebar)] border border-[var(--border-main)] text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-main)] transition-all font-medium"
                    >
                        <CreditCard size={18} className="mr-2" />
                        Vincular Assinaturas
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-sidebar)] p-6 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">Receitas</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">Total Receitas</p>
                    <p className="text-2xl font-bold text-[var(--text-main)]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.entradas)}
                    </p>
                </div>

                <div className="bg-[var(--bg-sidebar)] p-6 rounded-xl border border-[var(--border-main)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded">Despesas</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">Total Despesas</p>
                    <p className="text-2xl font-bold text-[var(--text-main)]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.saidas)}
                    </p>
                </div>

                <div className="bg-primary-600 p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between mb-4 text-white/80">
                        <div className="p-3 bg-white/10 rounded-lg text-white">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded">Balanço</span>
                    </div>
                    <p className="text-sm font-medium text-white/70">Saldo Atual</p>
                    <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.saldo)}
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-[var(--bg-sidebar)] p-4 rounded-xl border border-[var(--border-main)] shadow-sm mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Buscar Descrição</label>
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Tipo</label>
                        <select
                            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary-500"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                        >
                            <option value="todos">Todos</option>
                            <option value="entrada">Receita</option>
                            <option value="saida">Despesa</option>
                        </select>
                    </div>
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Categoria</label>
                        <select
                            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary-500"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="todos">Todas Categorias</option>
                            {Array.from(new Set(transactions.map(t => t.category).filter(Boolean))).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row gap-4 items-end w-full md:w-auto">
                        <div className="flex-1 sm:w-36">
                            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">De</label>
                            <input
                                type="date"
                                className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 sm:w-36">
                            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Até</label>
                            <input
                                type="date"
                                className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('todos');
                                setCategoryFilter('todos');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            title="Limpar Filtros"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[var(--bg-sidebar)] rounded-xl border border-[var(--border-main)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-main)]">
                    <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center">
                        <Calendar size={18} className="mr-2 text-primary-500" />
                        Transações
                    </h2>
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Data</th>
                                <th className="px-6 py-3 font-semibold">Descrição</th>
                                <th className="px-6 py-3 font-semibold">Categoria</th>
                                <th className="px-6 py-3 font-semibold text-right">Valor</th>
                                <th className="px-6 py-3 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-main)]">
                            {filteredTransactions.map((t: Transaction) => (
                                <tr key={t.id} className="hover:bg-[var(--bg-main)] transition-colors">
                                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                        {format(new Date(t.date), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {t.type === 'entrada' ? (
                                                <ArrowUpCircle size={16} className="text-green-500 mr-2" />
                                            ) : (
                                                <ArrowDownCircle size={16} className="text-red-500 mr-2" />
                                            )}
                                            <span className="text-sm font-medium text-[var(--text-main)]">{t.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 text-[10px] font-bold uppercase rounded-md",
                                            t.type === 'entrada'
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                        )}>
                                            {t.category || 'Geral'}
                                        </span>
                                    </td>
                                    <td className={clsx(
                                        "px-6 py-4 text-sm font-bold text-right",
                                        t.type === 'entrada' ? "text-green-600" : "text-red-600"
                                    )}>
                                        {t.type === 'entrada' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            {t.category !== 'Assinatura' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEditTransaction(t)}
                                                        className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(t.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-[var(--text-muted)] italic font-medium uppercase">Assinatura</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-[var(--border-main)]">
                    {filteredTransactions.map((t: Transaction) => (
                        <div key={t.id} className="p-4 space-y-3 bg-[var(--bg-main)]/30">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    {t.type === 'entrada' ? (
                                        <ArrowUpCircle size={20} className="text-green-500" />
                                    ) : (
                                        <ArrowDownCircle size={20} className="text-red-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{t.description}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{format(new Date(t.date), 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                                <p className={clsx(
                                    "text-sm font-bold",
                                    t.type === 'entrada' ? "text-green-600" : "text-red-600"
                                )}>
                                    {t.type === 'entrada' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={clsx(
                                    "px-2 py-1 text-[9px] font-bold uppercase rounded-md",
                                    t.type === 'entrada'
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                )}>
                                    {t.category || 'Geral'}
                                </span>
                                <div className="flex space-x-2">
                                    {t.category !== 'Assinatura' ? (
                                        <>
                                            <button
                                                onClick={() => handleEditTransaction(t)}
                                                className="p-2 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTransaction(t.id)}
                                                className="p-2 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-[var(--text-muted)] italic font-medium uppercase">Assinatura</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="px-6 py-10 text-center text-[var(--text-muted)] italic border-t border-[var(--border-main)]">
                        Nenhuma transação encontrada com os filtros atuais.
                    </div>
                )}
            </div>

            {/* Transaction Modal */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-sidebar)] rounded-xl border border-[var(--border-main)] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{editingTransaction ? 'Editar' : 'Nova'} Transação</h3>
                            <button onClick={() => { setShowTransactionModal(false); resetTransactionForm(); setEditingTransaction(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tipo</label>
                                <select
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTransaction.type}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                >
                                    <option value="entrada">Receita</option>
                                    <option value="saida">Despesa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Valor</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: maskCurrency(e.target.value) })}
                                    placeholder="R$ 0,00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                    placeholder={newTransaction.type === 'entrada' ? "Ex: Receita de Evento" : "Ex: Pagamento Fornecedor"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Categoria</label>
                                <input
                                    type="text"
                                    list="categories-list"
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTransaction.category}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    placeholder={newTransaction.type === 'entrada' ? "Ex: Venda, Patrocínio, etc" : "Ex: Marketing, Aluguel, etc"}
                                />
                                <datalist id="categories-list">
                                    {getAvailableCategories().map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Data</label>
                                <input
                                    type="date"
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-md">
                                {editingTransaction ? 'Salvar Alterações' : 'Salvar Transação'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Subscription Modal */}
            {showSubscriptionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-sidebar)] rounded-xl border border-[var(--border-main)] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Garantir Assinatura</h3>
                            <button onClick={() => { setShowSubscriptionModal(false); resetSubscriptionForm(); }} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Artista</label>
                                <select
                                    required
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newSubscription.artist_id}
                                    onChange={(e) => setNewSubscription({ ...newSubscription, artist_id: e.target.value })}
                                >
                                    <option value="">Selecione um artista</option>
                                    {artists.map((a: any) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Plano</label>
                                <select
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newSubscription.plan_type}
                                    onChange={(e) => setNewSubscription({ ...newSubscription, plan_type: e.target.value })}
                                >
                                    <option value="mensal">Mensal</option>
                                    <option value="trimestral">Trimestral</option>
                                    <option value="semestral">Semestral</option>
                                    <option value="anual">Anual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Valor do Plano</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newSubscription.amount}
                                    onChange={(e) => setNewSubscription({ ...newSubscription, amount: maskCurrency(e.target.value) })}
                                    placeholder="R$ 0,00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Data Início</label>
                                <input
                                    type="date"
                                    className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newSubscription.start_date}
                                    onChange={(e) => setNewSubscription({ ...newSubscription, start_date: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-md">
                                Confirmar Assinatura
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
