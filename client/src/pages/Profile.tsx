import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Shield, Save, Camera, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar_url: user?.avatar_url || '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await axios.post('http://localhost:5000/api/users/upload-avatar', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar_url: res.data.url }));
            setMessage({ type: 'success', text: 'Foto carregada! Clique em salvar para confirmar.' });
        } catch (error: any) {
            console.error('Upload error:', error.response?.data);
            setMessage({
                type: 'error',
                text: error.response?.data?.error === 'Bucket not found'
                    ? 'Erro: Bucket "images" não foi encontrado no Supabase. Crie-o como público no painel Storage.'
                    : 'Erro ao subir imagem.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.put(`http://localhost:5000/api/users/${user?.id}`, formData);
            // Atualiza o contexto de auth com os novos dados
            const token = localStorage.getItem('token');
            if (token) {
                login(token, res.data);
            }
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar perfil.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-main)]">Meu Perfil</h1>
                <p className="text-[var(--text-muted)]">Gerencie suas informações pessoais e foto de perfil.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Avatar */}
                <div className="lg:col-span-1">
                    <div className="card p-6 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-main)] bg-[var(--bg-main)] flex items-center justify-center overflow-hidden shadow-inner">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-[var(--text-muted)] opacity-40" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-[var(--bg-sidebar)]/60 flex items-center justify-center">
                                        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="font-bold text-[var(--text-main)]">{user?.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-600 border border-primary-500/20 uppercase mt-1">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Principal: Formulário */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="card overflow-hidden">
                        <div className="p-6 space-y-6">
                            {message.text && (
                                <div className={`p-4 rounded-xl flex items-center space-x-2 border transition-all ${message.type === 'success'
                                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                    }`}>
                                    {message.type === 'success' && <CheckCircle size={18} />}
                                    <p className="text-sm font-semibold">{message.text}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Nome Completo</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">E-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field pl-10 bg-[var(--bg-main)] opacity-70 cursor-not-allowed"
                                            disabled // E-mail geralmente é fixo em sistemas simples
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] italic mt-1 font-medium">O e-mail não pode ser alterado.</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Nova Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                            <Shield size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Deixe em branco para não alterar"
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-[var(--bg-main)] border-t border-[var(--border-main)] flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="btn-primary flex items-center space-x-2 px-6"
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
