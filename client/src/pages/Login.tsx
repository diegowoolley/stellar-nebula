import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/api';

export const Login = () => {
    // Estados para armazenar credenciais, erros e carregamento
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Lida com o envio do formulário de login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Tenta fazer login na API
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            // Salva token e usuário no contexto
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-main)] relative">
            {/* Alternador de Tema (Toggle) - Canto Superior Direito */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-all z-20 shadow-lg"
                title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Lado Esquerdo - Branding e Elementos Visuais */}
            <div className="hidden lg:flex w-1/2 bg-primary-950 justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 opacity-95"></div>
                {/* Círculos decorativos */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-white p-12 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-32 w-auto min-w-[128px] bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 flex items-center justify-center translate-y-2">
                            <img src="/logo.png" alt="Dw Sistemas Logo" className="h-full w-auto object-contain" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Dw Sistemas</h1>
                    <p className="text-primary-100 text-lg max-w-md mx-auto">
                        A plataforma completa para gestão de eventos artísticos, artistas e contratantes.
                    </p>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg-sidebar)] border-l border-[var(--border-main)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[var(--text-main)]">Bem-vindo de volta</h2>
                        <p className="mt-2 text-[var(--text-muted)] font-medium">Por favor, insira suas credenciais para entrar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 text-red-600 p-4 rounded-xl text-sm border border-red-500/20 flex items-center backdrop-blur-sm">
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-40"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] opacity-60">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-40"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-[var(--border-main)] bg-[var(--bg-main)] rounded transition-all"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-main)] font-medium">
                                    Lembrar-me
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link to="/forgot-password" title="recuperação" className="font-medium text-primary-600 hover:text-primary-500">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Entrando...' : 'Entrar na Plataforma'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em]">
                        <p>&copy; 2024 Dw Sistemas. Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
