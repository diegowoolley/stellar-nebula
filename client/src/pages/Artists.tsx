import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, MoreVertical, Music, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

interface Artist {
    id: string;
    name: string;
    logo_url: string;
}

export const Artists = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        logo_url: ''
    });

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/artists');
            setArtists(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Este artista será removido permanentemente.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/artists/${id}`);
            fetchArtists();
        } catch (error) {
            alert('Erro ao excluir artista.');
        }
    };

    const handleOpenSidebar = (artist?: Artist) => {
        if (artist) {
            setEditingArtist(artist);
            setFormData({ name: artist.name, logo_url: artist.logo_url || '' });
        } else {
            setEditingArtist(null);
            setFormData({ name: '', logo_url: '' });
        }
        setIsSidebarOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fData = new FormData();
        fData.append('file', file);

        try {
            const res = await axios.post('http://localhost:5000/api/artists/upload', fData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, logo_url: res.data.url }));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao fazer upload da imagem.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert('O nome do artista é obrigatório.');

        setIsSubmitting(true);
        try {
            if (editingArtist) {
                await axios.put(`http://localhost:5000/api/artists/${editingArtist.id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/artists', formData);
            }
            fetchArtists();
            setIsSidebarOpen(false);
            setFormData({ name: '', logo_url: '' });
            setEditingArtist(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao salvar artista.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Artistas</h1>
                    <p className="text-sm text-[var(--text-muted)]">Gerenciamento do casting.</p>
                </div>
                {user?.role !== 'viewer' && (
                    <button
                        onClick={() => handleOpenSidebar()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus size={18} />
                        <span>Novo Artista</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-secondary-100 rounded-lg"></div>)}
                </div>
            ) : artists.length === 0 ? (
                <div className="card p-12 text-center border-dashed">
                    <Music size={32} className="mx-auto text-[var(--text-muted)] opacity-50 mb-4" />
                    <h3 className="text-[var(--text-main)] font-bold">Nenhum artista</h3>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Comece adicionando seu primeiro artista.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {artists.map((artist) => (
                        <div key={artist.id} className="card group">
                            <div className="p-4 flex items-center space-x-4">
                                <div className="w-12 h-12 bg-[var(--bg-main)] rounded flex-shrink-0 flex items-center justify-center text-primary-600 overflow-hidden border border-[var(--border-main)]">
                                    {artist.logo_url ? (
                                        <img src={artist.logo_url} alt={artist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={20} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[var(--text-main)] truncate">
                                        {artist.name}
                                    </h3>
                                    <div className="flex items-center mt-0.5">
                                        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded uppercase border border-green-500/20">Ativo</span>
                                    </div>
                                </div>
                                <button className="text-[var(--text-muted)] hover:text-secondary-600">
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <div className="bg-[var(--bg-main)] px-4 py-2 border-t border-[var(--border-main)] flex items-center justify-end space-x-2">
                                {user?.role !== 'viewer' && (
                                    <button
                                        onClick={() => handleOpenSidebar(artist)}
                                        className="p-1.5 text-[var(--text-muted)] hover:text-primary-600 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => handleDelete(artist.id)}
                                        className="p-1.5 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slide-over Panel Simplified */}
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
                                {editingArtist ? 'Editar Artista' : 'Novo Artista'}
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-lg bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] overflow-hidden">
                                        {formData.logo_url ? (
                                            <img src={formData.logo_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Music size={24} />
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-[var(--bg-main)]/60 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 p-1.5 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-md shadow-sm hover:bg-[var(--bg-main)]"
                                    >
                                        <ImageIcon size={14} className="text-[var(--text-muted)]" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Nome do Artista</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">URL da Logo</label>
                                    <input
                                        type="url"
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
                                disabled={isSubmitting || isUploading}
                                className="flex-[2] btn-primary text-sm"
                            >
                                {isSubmitting ? 'Salvando...' : editingArtist ? 'Salvar Alterações' : 'Cadastrar Artista'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
