import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

export const ResetPassword = () => {
    // Parâmetros de busca para capturar o token da URL
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Estados do formulário e feedback
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Valida se o token está presente ao carregar a página
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de recuperação inválido ou expirado.');
        }
    }, [token]);

    // Lida com a redefinição de senha
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação básica de coincidência de senhas
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem.');
            return;
        }

        setStatus('loading');
        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                newPassword: password
            });

            setStatus('success');
            setMessage(response.data.message);

            // Redireciona para o login após 3 segundos em caso de sucesso
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Erro ao redefinir senha.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-sidebar)] p-8 rounded-2xl border border-[var(--border-main)] shadow-xl relative overflow-hidden">
                {/* Efeito Visual de Fundo */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Key size={32} className="text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--text-main)]">Nova Senha</h2>
                        <p className="mt-2 text-[var(--text-muted)] font-medium">Crie uma senha forte para sua conta.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                                <p className="text-[var(--text-main)] font-semibold">{message}</p>
                                <p className="text-sm text-[var(--text-muted)] mt-2">Você será redirecionado para o login em instantes...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {(status === 'error' || !token) && (
                                <div className="bg-red-500/10 text-red-600 p-4 rounded-xl text-sm border border-red-500/20 flex items-start space-x-2 font-semibold">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <span>{message}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">Nova Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-[var(--text-muted)] mt-1"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">Confirmar Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-[var(--text-muted)] mt-1"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading' || !token}
                                className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all active:scale-[0.98] ${(status === 'loading' || !token) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {status === 'loading' ? 'Alterando...' : 'Redefinir Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
