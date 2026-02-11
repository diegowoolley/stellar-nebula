import {
    Users,
    TrendingUp,
    CheckCircle2,
    Clock,
    MapPin,
    ChevronRight
} from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            {/* Titulo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Dashboard</h1>
                    <p className="text-sm text-[var(--text-muted)]">Visão geral do sistema Stellar Nebula.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Shows Confirmados', val: '24', icon: CheckCircle2, color: 'text-green-600', trend: '+12%', trendUp: true },
                    { label: 'Artistas Ativos', val: '12', icon: Users, color: 'text-primary-600', trend: '+2', trendUp: true },
                    { label: 'Eventos Pendentes', val: '08', icon: Clock, color: 'text-orange-600', trend: '-5%', trendUp: false },
                    { label: 'Receita Prevista', val: 'R$ 450k', icon: TrendingUp, color: 'text-blue-600', trend: '+18%', trendUp: true },
                ].map((stat, i) => (
                    <div key={i} className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded bg-primary-500/10 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-main)]">{stat.val}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Próximos Eventos */}
                <div className="lg:col-span-2 card">
                    <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
                        <h3 className="font-bold text-[var(--text-main)]">Próximos Eventos</h3>
                        <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center">
                            Ver todos <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                    <div className="divide-y divide-[var(--border-main)]">
                        {[
                            { artist: 'Vintage Culture', venue: 'Allianz Parque', date: '22 Abr', city: 'São Paulo, SP' },
                            { artist: 'Alok', venue: 'Laroc Club', date: '28 Abr', city: 'Valinhos, SP' },
                            { artist: 'Cat Dealers', venue: 'Green Valley', date: '04 Mai', city: 'Camboriú, SC' },
                        ].map((event, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-[var(--bg-main)] transition-colors cursor-pointer">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-[var(--bg-main)] border border-[var(--border-main)] rounded flex items-center justify-center text-[var(--text-main)] font-bold text-sm">
                                        {event.artist.split(' ')[0][0]}{event.artist.split(' ')[1]?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--text-main)]">{event.artist}</p>
                                        <div className="flex items-center text-[11px] text-[var(--text-muted)] mt-0.5">
                                            <MapPin size={10} className="mr-1" /> {event.venue} • {event.city}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[var(--text-main)]">{event.date}</p>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-tighter">CONFIRMADO</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Atividade Recente */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-[var(--border-main)]">
                        <h3 className="font-bold text-[var(--text-main)]">Atividade Recente</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { user: 'Ana Paula', action: 'anexou contrato', target: 'P12 Jurerê', time: '2h atrás' },
                            { user: 'Ricardo', action: 'cadastrou artista', target: 'DUBDOGZ', time: '5h atrás' },
                            { user: 'Diego', action: 'confirmou data', target: 'Rock in Rio', time: 'Ontem' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className="w-7 h-7 bg-primary-500/10 rounded-full flex-shrink-0 flex items-center justify-center text-primary-600 text-[10px] font-bold border border-primary-500/20">
                                    {activity.user.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--text-main)] leading-tight">
                                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold">{activity.target}</span>
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
