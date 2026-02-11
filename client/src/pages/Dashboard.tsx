import { useEffect, useState } from 'react';
import {
    Users,
    CheckCircle2,
    MapPin,
    Calendar as CalendarIcon,
    ChevronRight,
    Loader2,
    Music,
    Clock
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipagens
interface Stats {
    totalShows: number;
    confirmedShows: number;
    pendingShows: number;
    cancelledShows: number;
    activeArtists: number;
    citiesServed: number;
}

interface StatusDistribution {
    status: string;
    count: number;
    color: string;
}

interface MonthlyShow {
    month: string;
    shows: number;
}

interface TopArtist {
    name: string;
    shows: number;
}

interface TopCity {
    city: string;
    events: number;
}

interface UpcomingShow {
    id: string;
    artist: string;
    city: string;
    state: string;
    date: string;
    status: string;
}

interface DashboardData {
    stats: Stats;
    statusDistribution: StatusDistribution[];
    monthlyShows: MonthlyShow[];
    topArtists: TopArtist[];
    topCities: TopCity[];
    upcomingShows: UpcomingShow[];
}

// Componente de Tooltip customizado para melhor legibilidade em ambos os temas
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-sidebar)] border-2 border-[var(--border-main)] rounded-xl p-3 shadow-xl">
                {label && (
                    <p className="text-xs font-black text-[var(--text-main)] mb-2 uppercase tracking-wider">
                        {label}
                    </p>
                )}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-sm font-bold text-[var(--text-main)]">
                            {entry.name}: {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('[Dashboard] Buscando dados...');
                const response = await api.get('/stats');
                console.log('[Dashboard] Dados recebidos:', response.data);
                setData(response.data);
            } catch (err: any) {
                console.error('[Dashboard] Erro:', err);
                setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-muted)]">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-medium">Carregando dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-red-600 text-sm font-bold">
                {error || 'Erro ao carregar dados'}
            </div>
        );
    }

    const { stats, statusDistribution, monthlyShows, topArtists, topCities, upcomingShows } = data;

    // Cards de estatísticas
    const statCards = [
        {
            label: 'Total de Shows',
            value: stats.totalShows.toString(),
            icon: Music,
            color: 'text-primary-600',
            bg: 'bg-primary-500/10',
            trend: `${stats.confirmedShows} confirmados`
        },
        {
            label: 'Shows Confirmados',
            value: stats.confirmedShows.toString(),
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-500/10',
            trend: `${stats.pendingShows} pendentes`
        },
        {
            label: 'Artistas Ativos',
            value: stats.activeArtists.toString(),
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
            trend: 'cadastrados'
        },
        {
            label: 'Cidades Atendidas',
            value: stats.citiesServed.toString(),
            icon: MapPin,
            color: 'text-purple-600',
            bg: 'bg-purple-500/10',
            trend: 'no Brasil'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Dashboard</h1>
                    <p className="text-sm text-[var(--text-muted)]">Visão geral do sistema Dw Sistemas</p>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="card p-5 group hover:border-primary-500/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[var(--text-main)]">{stat.value}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] mt-1 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">{stat.trend}</p>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Pizza: Distribuição por Status */}
                <div className="card p-6">
                    <div className="mb-6">
                        <h3 className="font-bold text-[var(--text-main)]">Distribuição por Status</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Proporção de eventos por status</p>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {statusDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(props: any) => {
                                            const { status, count, percent } = props;
                                            return `${status}: ${count} (${(percent * 100).toFixed(0)}%)`;
                                        }}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-[var(--text-muted)] text-sm">Nenhum evento cadastrado</p>
                        )}
                    </div>
                </div>

                {/* Gráfico de Barras: Shows por Mês */}
                <div className="card p-6">
                    <div className="mb-6">
                        <h3 className="font-bold text-[var(--text-main)]">Shows por Mês</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Distribuição temporal de agendamentos</p>
                    </div>
                    <div className="h-[300px] w-full">
                        {monthlyShows.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyShows}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="shows" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-[var(--text-muted)] text-sm">Nenhum dado disponível</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Artistas e Próximos Shows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top 5 Artistas */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-[var(--border-main)]">
                        <h3 className="font-bold text-[var(--text-main)]">Top Artistas</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Artistas com mais shows</p>
                    </div>
                    <div className="p-6">
                        {topArtists.length > 0 ? (
                            <div className="space-y-4">
                                {topArtists.map((artist, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary-500/10 text-primary-600 rounded-lg flex items-center justify-center font-black text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-bold text-[var(--text-main)]">{artist.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-[var(--text-muted)] bg-[var(--bg-main)] px-3 py-1 rounded-full">
                                            {artist.shows} {artist.shows === 1 ? 'show' : 'shows'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[var(--text-muted)] text-sm text-center py-8">Nenhum artista com shows</p>
                        )}
                    </div>
                </div>

                {/* Próximos Shows */}
                <div className="lg:col-span-2 card">
                    <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-[var(--text-main)]">Próximos Shows</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Eventos futuros confirmados e pendentes</p>
                        </div>
                        <button
                            onClick={() => navigate('/calendar')}
                            className="text-xs font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 flex items-center transition-colors"
                        >
                            Ver agenda <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                    <div className="divide-y divide-[var(--border-main)]">
                        {upcomingShows.length > 0 ? (
                            upcomingShows.map((show) => (
                                <div key={show.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-main)] transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-xl flex flex-col items-center justify-center">
                                            <span className="text-xs font-black text-primary-600">
                                                {format(parseISO(show.date), 'dd')}
                                            </span>
                                            <span className="text-[9px] font-black text-primary-600/60 uppercase">
                                                {format(parseISO(show.date), 'MMM', { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-main)]">{show.artist}</p>
                                            <div className="flex items-center text-[10px] font-bold text-[var(--text-muted)] mt-0.5 uppercase tracking-tighter">
                                                <MapPin size={10} className="mr-1 text-primary-500" />
                                                {show.city}{show.state ? `, ${show.state}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-[var(--text-muted)] flex items-center justify-end">
                                            <Clock size={12} className="mr-1" />
                                            {format(parseISO(show.date), 'HH:mm')}
                                        </p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest mt-1 inline-block ${show.status === 'confirmed' ? 'text-green-600 bg-green-500/10 border-green-500/20' :
                                            'text-yellow-600 bg-yellow-500/10 border-yellow-500/20'
                                            }`}>
                                            {show.status === 'confirmed' ? 'CONFIRMADO' : 'PENDENTE'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                                <CalendarIcon size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="font-medium">Nenhum show futuro agendado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Cidades */}
            <div className="card">
                <div className="px-6 py-4 border-b border-[var(--border-main)]">
                    <h3 className="font-bold text-[var(--text-main)]">Cidades Mais Ativas</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Top 5 cidades com mais eventos</p>
                </div>
                <div className="p-6">
                    {topCities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {topCities.map((city, index) => (
                                <div key={index} className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-main)] hover:border-primary-500/50 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <MapPin size={16} className="text-primary-600" />
                                        <span className="text-xs font-black text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded-full">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-[var(--text-main)] truncate">{city.city}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                        {city.events} {city.events === 1 ? 'evento' : 'eventos'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-muted)] text-sm text-center py-8">Nenhuma cidade com eventos</p>
                    )}
                </div>
            </div>
        </div>
    );
};
