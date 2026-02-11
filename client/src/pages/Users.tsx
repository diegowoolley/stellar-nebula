import { useEffect, useState } from 'react';
import { Users as UsersIcon, Search, Plus, Mail, Shield, User, X, Save, Edit2, Trash2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import clsx from 'clsx';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'producer' | 'viewer';
    avatar_url?: string;
    created_at: string;
}

export const Users = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const { user: currentUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        avatar_url: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSidebar = (u?: UserData) => {
        if (u) {
            setEditingUser(u);
            setFormData({
                name: u.name || '',
                email: u.email,
                password: '', // Senha em branco ao editar
                role: u.role,
                avatar_url: u.avatar_url || ''
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'viewer', avatar_url: '' });
        }
        setIsSidebarOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim()) return alert('O e-mail é obrigatório.');
        if (!editingUser && !formData.password.trim()) return alert('A senha é obrigatória para novos usuários.');

        setIsSubmitting(true);
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            fetchUsers();
            setIsSidebarOpen(false);
            setEditingUser(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao salvar usuário.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await api.post('/users/upload-avatar', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar_url: res.data.url }));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao subir avatar.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) return alert('Você não pode excluir sua própria conta.');
        if (!confirm('Excluir este usuário permanentemente?')) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Erro ao excluir usuário.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Usuários</h1>
                    <p className="text-sm text-[var(--text-muted)]">Gestão de acesso e permissões da equipe.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => handleOpenSidebar()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Novo Usuário</span>
                    </button>
                )}
            </div>

            <div className="card overflow-hidden border-none sm:border sm:shadow-sm bg-transparent transition-all">
                <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou email..."
                            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="block md:hidden space-y-4 p-4 text-[var(--text-main)]">
                    {isLoading ? (
                        <div className="text-center py-8 text-sm text-[var(--text-muted)] animate-pulse">Carregando usuários...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <UsersIcon size={32} className="mx-auto text-secondary-200 mb-2" />
                            <p className="text-secondary-900 font-bold text-sm">Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        users.map((u) => (
                            <div key={u.id} className="card p-4 space-y-4 hover:border-primary-200 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] flex items-center justify-center font-bold text-sm mr-3 border border-[var(--border-main)] overflow-hidden uppercase">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                u.name?.charAt(0) || u.email.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-main)] leading-none mb-1">{u.name || 'Sem nome'}</p>
                                            <span className={clsx(
                                                "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                                                u.role === 'admin' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                    u.role === 'producer' ? "bg-primary-500/10 text-primary-600 border-primary-500/20" :
                                                        "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)]"
                                            )}>
                                                {u.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleOpenSidebar(u)}
                                            className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {u.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-[var(--border-main)] space-y-2">
                                    <div className="flex items-center text-xs text-[var(--text-muted)]">
                                        <Mail size={14} className="mr-2 opacity-60" /> {u.email}
                                    </div>
                                    <div className="flex items-center text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
                                        Cadastrado em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-main)]">
                        <thead className="bg-[var(--bg-main)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Usuário</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Função (Role)</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Cadastro</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--bg-sidebar)] divide-y divide-[var(--border-main)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-[var(--text-muted)] animate-pulse">Carregando usuários...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-12 text-center" colSpan={4}>
                                        <UsersIcon size={32} className="mx-auto text-secondary-200 mb-3" />
                                        <p className="text-secondary-900 font-bold text-sm">Nenhum usuário encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-[var(--bg-main)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-9 h-9 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] flex items-center justify-center font-bold text-xs mr-3 border border-[var(--border-main)] overflow-hidden uppercase shadow-sm">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.name?.charAt(0) || u.email.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-main)] leading-tight">{u.name || 'Sem nome'}</p>
                                                    <div className="flex items-center text-[11px] text-[var(--text-muted)] mt-0.5">
                                                        <Mail size={10} className="mr-1 opacity-60" /> {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                                u.role === 'admin' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                    u.role === 'producer' ? "bg-primary-500/10 text-primary-600 border-primary-500/20" :
                                                        "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)]"
                                            )}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-[var(--text-muted)] font-medium lowercase">
                                                {new Date(u.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-1">
                                                <button
                                                    onClick={() => handleOpenSidebar(u)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-[var(--bg-main)] rounded-lg transition-all hover:shadow-sm"
                                                    title="Editar usuário"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {u.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-[var(--bg-main)] rounded-lg transition-all hover:shadow-sm"
                                                        title="Excluir usuário"
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

            {/* Slide-over User Panel */}
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
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-[var(--bg-main)] border-2 border-[var(--border-main)] flex items-center justify-center overflow-hidden">
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-[var(--text-muted)]" />
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-[var(--bg-main)]/60 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-[var(--bg-main)] transition-colors">
                                        <Plus size={16} className="text-[var(--text-muted)]" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] mt-2 uppercase font-bold tracking-widest">Avatar do Usuário</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)] opacity-60">
                                            <User size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Ex: João Silva"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 input-field"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">E-mail (Login)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)] opacity-60">
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            placeholder="email@exemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 input-field"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                                        {editingUser ? 'Alterar Senha (Opcional)' : 'Senha Inicial'}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)] opacity-60">
                                            <Key size={16} />
                                        </span>
                                        <input
                                            type="password"
                                            placeholder={editingUser ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 input-field"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Função / Permissões</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)] opacity-60">
                                            <Shield size={16} />
                                        </span>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            className="w-full pl-10 input-field appearance-none"
                                        >
                                            <option value="viewer">Viewer (Apenas Leitura)</option>
                                            <option value="producer">Producer (Gestão de Eventos)</option>
                                            <option value="admin">Admin (Acesso Total)</option>
                                        </select>
                                    </div>
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
                                        <span>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</span>
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
