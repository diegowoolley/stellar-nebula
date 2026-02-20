import { useEffect, useState } from 'react';
import { Briefcase, Search, Plus, Mail, Phone, X, Save, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { maskPhone } from '../utils/format';
import api from '../services/api';
import clsx from 'clsx';

interface Contractor {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export const Contractors = () => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchContractors();
    }, []);

    const fetchContractors = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/contractors');
            setContractors(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSidebar = (contractor?: Contractor) => {
        if (contractor) {
            setEditingContractor(contractor);
            setFormData({
                name: contractor.name,
                email: contractor.email || '',
                phone: contractor.phone || ''
            });
        } else {
            setEditingContractor(null);
            setFormData({ name: '', email: '', phone: '' });
        }
        setIsSidebarOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert('O nome é obrigatório.');

        setIsSubmitting(true);
        try {
            if (editingContractor) {
                await api.put(`/contractors/${editingContractor.id}`, formData);
            } else {
                await api.post('/contractors', formData);
            }
            fetchContractors();
            setIsSidebarOpen(false);
            setFormData({ name: '', email: '', phone: '' });
            setEditingContractor(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao salvar contratante.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este contratante permanentemente?')) return;
        try {
            await api.delete(`/contractors/${id}`);
            fetchContractors();
        } catch (error) {
            alert('Erro ao excluir contratante.');
        }
    };

    const handleShareWhatsApp = async (contractor: Contractor) => {
        // Safari do iPhone bloqueia window.open dentro de async/await se não for chamado imediatamente.
        // A solução é abrir a janela antes da chamada de API e depois redirecionar.
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write('<html><body style="background:#111;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">Gerando link do WhatsApp...</body></html>');
        }

        try {
            // Obter token do backend
            const { data } = await api.post(`/contractors/${contractor.id}/link`);
            const token = data.token;

            const baseUrl = window.location.origin;
            const link = `${baseUrl}/external-request/${token}`;
            const text = `Olá ${contractor.name}, por favor preencha os dados do evento através deste link (Válido por 24h): ${link}`;
            const encodedText = encodeURIComponent(text);

            let digits = contractor.phone?.replace(/\D/g, '') || '';

            // Adiciona 55 (Brasil) se o número tiver apenas 10 ou 11 dígitos (DDD + número)
            if (digits.length === 10 || digits.length === 11) {
                digits = '55' + digits;
            }

            const whatsappUrl = `https://wa.me/${digits}?text=${encodedText}`;

            if (newWindow) {
                newWindow.location.href = whatsappUrl;
            } else {
                // Fallback caso o bloqueador de popup seja muito agressivo
                window.location.href = whatsappUrl;
            }

        } catch (error) {
            if (newWindow) newWindow.close();
            alert('Erro ao gerar link de compartilhamento.');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Contratantes</h1>
                    <p className="text-sm text-[var(--text-muted)]">Gestão de contatos e organizadores.</p>
                </div>
                {user?.role !== 'viewer' && (
                    <button
                        onClick={() => handleOpenSidebar()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Novo Contratante</span>
                    </button>
                )}
            </div>

            <div className="card overflow-hidden border-none sm:border sm:shadow-sm bg-transparent transition-all">
                <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Pesquisar contratante..."
                            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="block md:hidden space-y-4 p-4 text-[var(--text-main)]">
                    {isLoading ? (
                        <div className="text-center py-8 text-sm text-[var(--text-muted)] animate-pulse">Carregando contratantes...</div>
                    ) : contractors.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                            <p className="text-[var(--text-main)] font-bold text-sm">Nenhum contratante encontrado</p>
                        </div>
                    ) : (
                        contractors.map((c) => (
                            <div key={c.id} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-main)] shadow-sm space-y-4 hover:border-primary-500/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold text-sm mr-3 border border-primary-500/20 shadow-sm uppercase">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-main)] leading-tight mb-0.5">{c.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Corporativo</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleShareWhatsApp(c)}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        {user?.role !== 'viewer' && (
                                            <button
                                                onClick={() => handleOpenSidebar(c)}
                                                className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-[var(--border-main)] space-y-2">
                                    {c.email && (
                                        <div className="flex items-center text-xs text-[var(--text-muted)]">
                                            <Mail size={14} className="mr-2 opacity-60" /> {c.email}
                                        </div>
                                    )}
                                    {c.phone && (
                                        <div className="flex items-center text-xs text-[var(--text-muted)]">
                                            <Phone size={14} className="mr-2 opacity-60" /> {c.phone}
                                        </div>
                                    )}
                                </div>
                                {user?.role === 'admin' && (
                                    <div className="pt-2 flex justify-end">
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Excluir contratante"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-main)]">
                        <thead className="bg-[var(--bg-main)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Nome / Empresa</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Contato</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--bg-sidebar)] divide-y divide-[var(--border-main)] text-[var(--text-main)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-[var(--text-muted)] animate-pulse">Carregando contratantes...</td>
                                </tr>
                            ) : contractors.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-12 text-center" colSpan={3}>
                                        <Briefcase size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                                        <p className="text-[var(--text-main)] font-bold text-sm">Nenhum contratante encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                contractors.map((c) => (
                                    <tr key={c.id} className="hover:bg-[var(--bg-main)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-9 h-9 rounded bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold text-xs mr-3 border border-primary-500/20 shadow-sm uppercase">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-main)] leading-tight">{c.name}</p>
                                                    <p className="text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-tighter mt-0.5">Corporativo</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-[var(--text-muted)]">
                                                {c.email && (
                                                    <div className="flex items-center text-[11px]">
                                                        <Mail size={12} className="mr-1.5 opacity-60" /> {c.email}
                                                    </div>
                                                )}
                                                {c.phone && (
                                                    <div className="flex items-center text-[11px]">
                                                        <Phone size={12} className="mr-1.5 opacity-60" /> {c.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-1">
                                                <button
                                                    onClick={() => handleShareWhatsApp(c)}
                                                    title="Mandar Link via WhatsApp"
                                                    className="p-2 text-green-500 hover:bg-[var(--bg-main)] rounded-lg transition-all hover:shadow-sm"
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                {user?.role !== 'viewer' && (
                                                    <button
                                                        onClick={() => handleOpenSidebar(c)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-[var(--bg-main)] rounded-lg transition-all hover:shadow-sm"
                                                        title="Editar contratante"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-[var(--bg-main)] rounded-lg transition-all hover:shadow-sm"
                                                        title="Excluir contratante"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Registration Panel */}
            <div className={clsx(
                "fixed inset-0 z-50 overflow-hidden transition-opacity",
                isSidebarOpen ? "visible" : "invisible"
            )}>
                <div
                    className={clsx(
                        "absolute inset-0 bg-secondary-900/20 backdrop-blur-[2px] transition-opacity",
                        isSidebarOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                />

                <div className="absolute inset-y-0 right-0 max-w-full flex">
                    <div className={clsx(
                        "w-screen max-w-md transform transition-transform duration-300 bg-[var(--bg-sidebar)] shadow-xl flex flex-col border-l border-[var(--border-main)]",
                        isSidebarOpen ? "translate-x-0" : "translate-x-full"
                    )}>
                        <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[var(--text-main)]">
                                {editingContractor ? 'Editar Contratante' : 'Novo Contratante'}
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Nome / Empresa</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: T4F, Live Nation, etc."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">E-mail de Contato</label>
                                    <input
                                        type="email"
                                        placeholder="contato@empresa.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="+55 (11) 99999-9999"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-main)] flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex-1 px-4 py-2 border border-[var(--border-main)] text-[var(--text-muted)] font-semibold rounded-lg hover:bg-[var(--bg-sidebar)] text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] btn-primary text-sm flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? 'Salvando...' : (
                                    <>
                                        <Save size={18} />
                                        <span>{editingContractor ? 'Salvar Alterações' : 'Cadastrar Contratante'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
