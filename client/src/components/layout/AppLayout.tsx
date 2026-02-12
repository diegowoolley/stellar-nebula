import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Briefcase,
    LogOut,
    Bell,
    Search,
    ChevronDown,
    Menu,
    X,
    User,
    Sun,
    Moon
} from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

export const AppLayout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [pendingEvents, setPendingEvents] = useState<any[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Redireciona para o login se não estiver autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Busca eventos pendentes
    useEffect(() => {
        const fetchPendingEvents = async () => {
            try {
                const response = await api.get('/events/pending');
                setPendingEvents(response.data || []);
            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
            }
        };

        if (isAuthenticated) {
            fetchPendingEvents();
            // Opcional: Polling para atualizar a cada X segundos
            const interval = setInterval(fetchPendingEvents, 60000); // 1 min
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Definição dos itens de navegação lateral
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Agenda', href: '/calendar', icon: Calendar },
        { name: 'Artistas', href: '/artists', icon: Users },
        { name: 'Contratantes', href: '/contractors', icon: Briefcase },
        ...(user?.role === 'admin' ? [{ name: 'Usuários', href: '/users', icon: User }] : []),
    ];

    return (
        <div className="min-h-screen">
            {/* Sidebar (Barra Lateral) Desktop */}
            <aside className="fixed inset-y-0 left-0 hidden lg:flex lg:flex-col w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] z-50">
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Logo e Nome do Sistema */}
                    <div className="flex items-center h-16 px-6 border-b border-[var(--border-main)]">
                        <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center mr-3">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">Dw <span className="text-primary-600">Sistemas</span></span>
                    </div>

                    {/* Links de Navegação */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                        isActive
                                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sidebar)]'
                                    )}
                                >
                                    <item.icon className={clsx('mr-3 h-5 w-5', isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500')} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Botão de Sair (Logout) na base da Sidebar */}
                    <div className="p-4 border-t border-[var(--border-main)]">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-[var(--text-muted)] rounded-md hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Cabeçalho para Mobile */}
            <div className="lg:hidden flex items-center justify-between bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] h-16 px-4">
                <span className="font-bold text-[var(--text-main)]">Dw Sistemas</span>
                <div className="flex items-center space-x-2">
                    {/* Toggle de Tema no Mobile */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-full transition-all"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {/* Botão de Menu para abrir/fechar o overlay de navegação */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-[var(--text-muted)]"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Overlay do Menu Mobile (quando aberto) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-[var(--bg-sidebar)] pt-16">
                    <nav className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-4 py-3 text-base font-medium text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-lg"
                            >
                                <item.icon className="mr-4 h-6 w-6 text-secondary-400" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Conteúdo Principal (Main) */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Cabeçalho Superior (Navbar) para Desktop */}
                <header className="hidden lg:flex sticky top-0 z-40 bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] h-16 items-center px-8 justify-between">
                    {/* Barra de Pesquisa */}
                    <div className="flex items-center flex-1">
                        <div className="relative w-96 max-w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                className="w-full pl-10 pr-4 py-1.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-[var(--bg-sidebar)] transition-all transition-duration-300"
                            />
                        </div>
                    </div>

                    {/* Ações do Usuário (Tema, Notificações, Perfil) */}
                    <div className="flex items-center space-x-4">
                        {/* Toggle de Tema Dark/Light */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-full transition-all"
                            title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* Botão de Notificações */}
                        {/* Botão de Notificações */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-full transition-all"
                            >
                                <Bell size={18} />
                                {pendingEvents.length > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border border-[var(--bg-sidebar)]">
                                        {pendingEvents.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown de Notificações */}
                            {isNotificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsNotificationsOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                                        <div className="px-4 py-2 border-b border-[var(--border-main)] flex justify-between items-center">
                                            <h3 className="text-sm font-semibold text-[var(--text-main)]">Notificações</h3>
                                            <span className="text-xs text-[var(--text-muted)]">{pendingEvents.length} pendentes</span>
                                        </div>

                                        {pendingEvents.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                                Nenhuma notificação pendente
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-[var(--border-main)]">
                                                {pendingEvents.map((event) => (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => {
                                                            navigate(`/events/${event.id}`);
                                                            setIsNotificationsOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-main)] transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-medium text-[var(--text-main)] line-clamp-1">{event.event_name}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap ml-2">
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[var(--text-muted)] mb-1">
                                                            {event.contractors?.name ? `Contratante: ${event.contractors.name}` : 'Sem contratante'}
                                                        </p>
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                                Pendente
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-secondary-200"></div>

                        {/* Menu de Perfil do Usuário */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 pl-2 hover:bg-[var(--bg-main)] p-1.5 rounded-lg transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-[var(--text-main)] leading-none">{user?.name}</p>
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{user?.role}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs border border-primary-200 overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0)
                                    )}
                                </div>
                                <ChevronDown size={14} className={clsx("text-secondary-400 transition-transform", isProfileOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown de opções do perfil */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 border-b border-[var(--border-main)] lg:hidden">
                                            <p className="text-sm font-semibold text-[var(--text-main)]">{user?.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase">{user?.role}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full text-left px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)] flex items-center space-x-2"
                                        >
                                            <User size={14} />
                                            <span>Meu Perfil</span>
                                        </Link>
                                        <button className="w-full text-left px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)] flex items-center space-x-2">
                                            <LogOut size={14} className="text-red-500" />
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    logout();
                                                }}
                                                className="text-red-600"
                                            >
                                                Sair
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Renderização das rotas filhas via Outlet */}
                <main className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
