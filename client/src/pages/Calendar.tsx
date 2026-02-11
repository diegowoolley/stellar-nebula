import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Users as UsersIcon,
    Clock,
    Filter,
    CheckCircle2,
    Clock3,
    XCircle,
    MapPin,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import clsx from 'clsx';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventDetailsModal } from '../components/calendar/EventDetailsModal';

interface Artist {
    id: string;
    name: string;
    logo_url?: string;
}

interface EventData {
    id: string;
    artist_id: string;
    city: string;
    venue_name?: string;
    date: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    artists?: { name: string; logo_url: string };
}

export const Calendar = () => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string[]>(['confirmed', 'pending', 'cancelled']);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedArtistId, selectedStatus]); // Recarregar se filtros mudarem

    const fetchData = async () => {
        try {
            const [artistsRes, eventsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/artists'),
                axios.get('http://localhost:5000/api/events')
            ]);
            setArtists(artistsRes.data);

            // Filtro local (ou poderia ser via query no backend)
            let filteredEvents = eventsRes.data;
            if (selectedArtistId) {
                filteredEvents = filteredEvents.filter((e: any) => e.artist_id === selectedArtistId);
            }
            if (selectedStatus.length > 0) {
                filteredEvents = filteredEvents.filter((e: any) => selectedStatus.includes(e.status));
            }
            setEvents(filteredEvents);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const toggleStatus = (status: string) => {
        setSelectedStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    // Lógica da Grade do Calendário
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 size={10} />;
            case 'pending': return <Clock3 size={10} />;
            case 'cancelled': return <XCircle size={10} />;
            default: return null;
        }
    };

    const handleEventClick = (event: EventData) => {
        setSelectedEvent(event);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            <EventDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                event={selectedEvent}
                onUpdate={fetchData}
                onEventUpdate={setSelectedEvent}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Agenda</h1>
                    <p className="text-sm text-[var(--text-muted)]">Cronograma de shows e tours.</p>
                </div>
                <button
                    onClick={() => navigate('/events/new')}
                    className="flex items-center space-x-2 bg-[var(--agenda-bg-accent)] text-[var(--agenda-text-accent)] hover:opacity-90 px-5 py-2.5 rounded-xl border border-[var(--agenda-border-accent)] font-bold transition-all active:scale-95 shadow-md shadow-primary-500/10"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Novo Agendamento</span>
                </button>
            </div>

            {/* Filtros */}
            <div className="card p-4 space-y-6">
                {/* Artistas */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[var(--text-main)]">
                        <UsersIcon size={16} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-widest">Artista</span>
                    </div>

                    <div className="flex overflow-x-auto py-2 -mx-1 px-1 scrollbar-hide space-x-3">
                        <button
                            onClick={() => setSelectedArtistId(null)}
                            className={clsx(
                                "flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 w-32 shadow-sm hover:translate-y-[-2px]",
                                !selectedArtistId
                                    ? "bg-[var(--agenda-bg-accent)] text-[var(--agenda-text-accent)] border-[var(--agenda-border-accent)] ring-4 ring-primary-500/10"
                                    : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-primary-400 hover:text-[var(--text-main)]"
                            )}
                        >
                            <div className={clsx(
                                "w-14 h-14 rounded-full flex items-center justify-center mb-2 font-black text-[10px] tracking-widest border border-dashed transition-colors",
                                !selectedArtistId ? "bg-[var(--agenda-text-accent)]/10 text-[var(--agenda-text-accent)] border-[var(--agenda-border-accent)]/30" : "bg-[var(--bg-sidebar)] text-[var(--text-muted)] border-[var(--border-main)]"
                            )}>
                                ALL
                            </div>
                            <span className="text-[10px] font-black uppercase truncate w-full text-center">
                                Todos
                            </span>
                        </button>

                        {artists.map(artist => {
                            const isActive = selectedArtistId === artist.id;
                            return (
                                <button
                                    key={artist.id}
                                    onClick={() => setSelectedArtistId(artist.id)}
                                    className={clsx(
                                        "flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 w-32 shadow-sm hover:translate-y-[-2px]",
                                        isActive
                                            ? "bg-[var(--agenda-bg-accent)] text-[var(--agenda-text-accent)] border-[var(--agenda-border-accent)] ring-4 ring-primary-500/10"
                                            : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-primary-400 hover:text-[var(--text-main)]"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-14 h-14 rounded-full flex items-center justify-center mb-2 overflow-hidden border shadow-sm transition-colors",
                                        isActive ? "bg-[var(--agenda-bg-accent)] border-[var(--agenda-border-accent)]/30" : "bg-[var(--bg-sidebar)] border-[var(--border-main)]"
                                    )}>
                                        {artist.logo_url ? (
                                            <img src={artist.logo_url} alt={artist.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className={clsx(
                                                "text-sm font-black",
                                                isActive ? "text-[var(--agenda-text-accent)]" : "text-[var(--text-muted)] opacity-50"
                                            )}>
                                                {artist.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black uppercase truncate w-full text-center">
                                        {artist.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 text-[var(--text-main)]">
                        <Filter size={16} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-widest">Status do Evento</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'confirmed', label: 'Confirmado', color: 'bg-green-500' },
                            { id: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
                            { id: 'cancelled', label: 'Cancelado', color: 'bg-red-500' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => toggleStatus(status.id)}
                                className={clsx(
                                    "flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95",
                                    selectedStatus.includes(status.id)
                                        ? "bg-[var(--agenda-bg-accent)] text-[var(--agenda-text-accent)] border-[var(--agenda-border-accent)] shadow-md shadow-primary-500/10"
                                        : "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-primary-400"
                                )}
                            >
                                <div className={clsx(
                                    "w-2 h-2 rounded-full transition-colors",
                                    status.color,
                                    selectedStatus.includes(status.id) && "shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                )}></div>
                                <span>{status.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendário */}
            <div className="card h-full min-h-[600px] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-sidebar)] sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-bold text-[var(--text-main)] min-w-[150px]">
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-main)] rounded p-1 shadow-inner">
                            <button
                                onClick={prevMonth}
                                className="p-1 hover:bg-[var(--agenda-bg-accent)] hover:text-[var(--agenda-text-accent)] rounded transition-all text-[var(--text-main)] hover:shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-1 hover:bg-[var(--agenda-bg-accent)] hover:text-[var(--agenda-text-accent)] rounded transition-all text-[var(--text-main)] hover:shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button
                            onClick={goToToday}
                            className="text-[10px] font-black uppercase tracking-widest bg-[var(--agenda-bg-accent)] text-[var(--agenda-text-accent)] hover:opacity-90 px-4 py-1.5 rounded-full border border-[var(--agenda-border-accent)] transition-all active:scale-95 shadow-sm"
                        >
                            Hoje
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center bg-[var(--bg-main)] rounded p-1 shadow-inner border border-[var(--border-main)]">
                        <button className="px-4 py-1.5 text-xs font-bold bg-[var(--bg-sidebar)] shadow-sm rounded text-[var(--text-main)]">Mês</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Semana</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Dia</button>
                    </div>
                </div>

                {/* Grade do Calendário (Desktop) */}
                <div className="hidden lg:flex flex-1 flex-col">
                    {/* Dias da Semana */}
                    <div className="grid grid-cols-7 border-b border-[var(--border-main)] bg-[var(--bg-main)]/50">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="py-2.5 text-center text-[10px] font-black text-[var(--text-muted)] opacity-60 uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Dias do Mês */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-[var(--border-main)]">
                        {calendarDays.map((day) => {
                            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={day.toString()}
                                    className={clsx(
                                        "min-h-[120px] p-2 transition-colors relative group",
                                        !isCurrentMonth ? "bg-[var(--bg-main)]/50 opacity-40" : "bg-[var(--bg-sidebar)]",
                                        isToday && "bg-primary-500/5"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={clsx(
                                            "text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full transition-all group-hover:scale-110",
                                            isToday ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : !isCurrentMonth ? "text-[var(--text-muted)] opacity-30" : "text-[var(--text-main)]"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter opacity-60">
                                                {dayEvents.length} {dayEvents.length === 1 ? 'Show' : 'Shows'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className={clsx(
                                                    "p-2 rounded-lg border hover:shadow-md cursor-pointer transition-all active:scale-[0.97] mb-1",
                                                    event.status === 'confirmed' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                        event.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-semibold" :
                                                            "bg-red-500/10 text-red-600 border-red-500/20 line-through opacity-60"
                                                )}
                                            >
                                                <div className="flex items-center space-x-1 mb-0.5">
                                                    {getStatusIcon(event.status)}
                                                    <span className="text-[9px] font-bold uppercase overflow-hidden truncate">
                                                        {event.venue_name || event.city}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[8px] font-medium opacity-90">
                                                    <span className="flex items-center">
                                                        <Clock size={8} className="mr-0.5" />
                                                        {format(parseISO(event.date), 'HH:mm')}
                                                    </span>
                                                    <span className="truncate ml-1">
                                                        {event.artists?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botão de adicionar evento - Oculto para datas passadas */}
                                    {(!isSameDay(day, new Date()) && day < new Date()) ? null : (
                                        <button
                                            className="absolute bottom-1.5 right-1.5 p-1.5 bg-[var(--bg-sidebar)] text-[var(--text-muted)] hover:text-primary-600 rounded-full border border-[var(--border-main)] opacity-0 group-hover:opacity-100 shadow-md transition-all hover:scale-110"
                                            title="Agendar neste dia"
                                            onClick={() => navigate('/events/new', { state: { initialDate: day.toISOString() } })}
                                        >
                                            <Plus size={12} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="lg:hidden flex-1 overflow-y-auto bg-[var(--bg-main)] p-4 space-y-4 min-h-[400px]">
                    {events.filter(e => isSameMonth(parseISO(e.date), currentMonth)).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <CalendarIcon size={48} className="text-[var(--text-muted)] opacity-20 mb-4" />
                            <p className="text-[var(--text-main)] font-black">Nenhum evento este mês</p>
                            <p className="text-[var(--text-muted)] text-xs mt-1 font-medium">Tente mudar o filtro ou navegar para outro mês.</p>
                        </div>
                    ) : (
                        events
                            .filter(e => isSameMonth(parseISO(e.date), currentMonth))
                            .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                            .map((event) => {
                                const eventDate = parseISO(event.date);

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => handleEventClick(event)}
                                        className={clsx(
                                            "bg-[var(--bg-sidebar)] rounded-2xl border border-[var(--border-main)] shadow-sm overflow-hidden active:scale-[0.98] transition-all",
                                            event.status === 'cancelled' && "opacity-60 grayscale"
                                        )}
                                    >
                                        <div className="flex">
                                            {/* Faixa Lateral de Data */}
                                            <div className={clsx(
                                                "w-16 flex flex-col items-center justify-center border-r border-[var(--border-main)]",
                                                event.status === 'confirmed' ? "bg-green-500/10 text-green-600" :
                                                    event.status === 'pending' ? "bg-yellow-500/10 text-yellow-600" :
                                                        "bg-red-500/10 text-red-600"
                                            )}>
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{format(eventDate, 'MMM', { locale: ptBR })}</span>
                                                <span className="text-xl font-black leading-none">{format(eventDate, 'dd')}</span>
                                                <span className="text-[9px] font-black opacity-60 mt-1">{format(eventDate, 'HH:mm')}</span>
                                            </div>

                                            {/* Conteúdo do Card */}
                                            <div className="flex-1 p-3 flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--bg-main)] overflow-hidden flex-shrink-0 border border-[var(--border-main)]">
                                                    {event.artists?.logo_url ? (
                                                        <img src={event.artists.logo_url} alt={event.artists.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-black text-[10px] opacity-40">
                                                            {event.artists?.name?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h4 className="text-sm font-black text-[var(--text-main)] truncate pr-2">{event.artists?.name}</h4>
                                                        <div className={clsx(
                                                            "w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900 border",
                                                            event.status === 'confirmed' ? "bg-green-500" :
                                                                event.status === 'pending' ? "bg-yellow-500" : "bg-red-500"
                                                        )}></div>
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-[var(--text-muted)] font-black uppercase opacity-60">
                                                        <MapPin size={10} className="mr-1" />
                                                        <span className="truncate tracking-tighter">{event.venue_name || event.city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Footer / Legenda */}
                <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-main)] flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-md"></div>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-80">Confirmado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-md"></div>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-80">Pendente/Reserva</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-md"></div>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-80">Cancelado</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
