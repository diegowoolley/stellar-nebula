import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config/api';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setMessage(response.data.message);
            setStatus('success');

            // Log para debug em dev (simulando recebimento do token)
            if (response.data.debugToken) {
                console.log('%c [DEBUG] Token de Recuperação:', 'background: #222; color: #bada55', response.data.debugToken);
            }
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-sidebar)] p-8 rounded-2xl border border-[var(--border-main)] shadow-xl relative overflow-hidden">
                {/* Efeito Visual */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} className="text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--text-main)]">Recuperar Senha</h2>
                        <p className="mt-2 text-[var(--text-muted)] font-medium">Insira seu e-mail para receber as instruções.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                                <p className="text-[var(--text-main)] font-semibold mb-2">{message}</p>
                                <p className="text-sm text-[var(--text-muted)]">Verifique sua caixa de entrada (e a pasta de spam).</p>
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-primary-600 font-bold hover:text-primary-500 transition-colors"
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                Voltar para o Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-500/10 text-red-600 p-4 rounded-xl text-sm border border-red-500/20 font-semibold">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">E-mail Cadastrado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-[var(--text-muted)]"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all active:scale-[0.98] ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {status === 'loading' ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>

                            <Link
                                to="/login"
                                className="flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                <ArrowLeft size={14} className="mr-2" />
                                Voltar ao Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
