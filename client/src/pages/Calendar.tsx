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
    Calendar as CalendarIcon,
    Edit2,
    Check,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Interface para os dados dos artistas
interface Artist {
    id: string;
    name: string;
    logo_url?: string;
}

// Interface para os dados dos eventos/shows
interface EventData {
    id: string;
    artist_id: string;
    contractor_id?: string;
    city: string;
    state?: string;
    type?: string;
    venue_name?: string;
    date: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    artists?: { name: string; logo_url: string };
    contractors?: { name: string };
    created_at?: string;
    details_contacts?: any;
    details_suppliers?: any;
    details_transports?: any;
    details_lodging?: any;
    details_lineup?: any;
    contract_url?: string;
    event_name?: string;
    created_by?: string;
    updated_at?: string;
}

export const Calendar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados para controle de dados e UI
    const [artists, setArtists] = useState<Artist[]>([]);
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string[]>(['confirmed', 'pending', 'cancelled']);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Efeito para buscar dados sempre que os filtros de artista ou status mudarem
    useEffect(() => {
        fetchData();
    }, [selectedArtistId, selectedStatus]);

    // Função para buscar artistas e eventos do backend via api service
    const fetchData = async () => {
        try {
            const [artistsRes, eventsRes] = await Promise.all([
                api.get('/artists'),
                api.get('/events')
            ]);
            setArtists(artistsRes.data);

            // Filtra os eventos localmente com base nos seletores da UI
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

    const handleStatusUpdate = async (e: React.MouseEvent, eventId: string, newStatus: string) => {
        e.stopPropagation(); // Prevents opening the modal
        if (!confirm(`Deseja alterar o status para ${newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'pending' ? 'Pendente' : 'Cancelado'}?`)) return;

        try {
            await api.put(`/events/${eventId}`, { status: newStatus });
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status do evento.');
        }
    };

    const handleEditClick = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        navigate(`/events/edit/${eventId}`);
    };

    // Funções de navegação do calendário
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Altera a seleção de status no filtro
    const toggleStatus = (status: string) => {
        setSelectedStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    // Cálculos para a grade do calendário usando date-fns
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Retorna o ícone correspondente ao status do evento
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 size={10} />;
            case 'pending': return <Clock3 size={10} />;
            case 'cancelled': return <XCircle size={10} />;
            default: return null;
        }
    };

    // Lida com o clique em um evento para abrir detalhes
    const handleEventClick = (event: EventData) => {
        setSelectedEvent(event);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Modal de Detalhes do Evento */}
            {/* Modal de Detalhes do Evento */}
            {selectedEvent && (
                <EventDetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    event={selectedEvent}
                    onUpdate={fetchData}
                    onEventUpdate={setSelectedEvent}
                />
            )}

            {/* Cabeçalho de Título e Ação */}
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

            {/* Filtros de Visualização */}
            <div className="card p-4 space-y-6">
                {/* Seletor de Artistas (Horizontal Scroll) */}
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

                {/* Filtro por Status do Evento */}
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

            {/* Container do Calendário Principal */}
            <div className="card h-full min-h-[600px] flex flex-col overflow-hidden">
                {/* Barra de Ferramentas do Calendário (Mês atual e navegação) */}
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

                    {/* Seletores de Visualização (Mês/Semana/Dia) - Apenas Desktop */}
                    <div className="hidden sm:flex items-center bg-[var(--bg-main)] rounded p-1 shadow-inner border border-[var(--border-main)]">
                        <button className="px-4 py-1.5 text-xs font-bold bg-[var(--bg-sidebar)] shadow-sm rounded text-[var(--text-main)]">Mês</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Semana</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Dia</button>
                    </div>
                </div>

                {/* Grade do Calendário (Versão Desktop) */}
                <div className="hidden lg:flex flex-1 flex-col">
                    {/* Linha dos Dias da Semana */}
                    <div className="grid grid-cols-7 border-b border-[var(--border-main)] bg-[var(--bg-main)]/50">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="py-2.5 text-center text-[10px] font-black text-[var(--text-muted)] opacity-60 uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grade de Células de Dias */}
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

                                    {/* Lista de Eventos no Dia */}
                                    <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className={clsx(
                                                    "p-2 rounded-lg border hover:shadow-md cursor-pointer transition-all active:scale-[0.97] mb-1 group/card",
                                                    event.status === 'confirmed' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                        event.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-semibold" :
                                                            "bg-red-500/10 text-red-600 border-red-500/20 line-through opacity-60"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center space-x-1 overflow-hidden">
                                                        {getStatusIcon(event.status)}
                                                        <span className="text-[9px] font-bold uppercase overflow-hidden truncate">
                                                            {event.venue_name || event.city}
                                                        </span>
                                                    </div>

                                                    {/* Quick Actions (Admin/Producer) */}
                                                    {(user?.role === 'admin' || user?.role === 'producer') && (
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover/card:opacity-100 transition-opacity">

                                                            <button
                                                                onClick={(e) => handleEditClick(e, event.id)}
                                                                className="p-0.5 hover:bg-black/10 rounded text-[var(--text-main)]"
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={8} />
                                                            </button>
                                                            {event.status !== 'confirmed' && (
                                                                <button
                                                                    onClick={(e) => handleStatusUpdate(e, event.id, 'confirmed')}
                                                                    className="p-0.5 hover:bg-green-500/20 rounded text-green-600"
                                                                    title="Confirmar"
                                                                >
                                                                    <Check size={8} />
                                                                </button>
                                                            )}
                                                            {event.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={(e) => handleStatusUpdate(e, event.id, 'cancelled')}
                                                                    className="p-0.5 hover:bg-red-500/20 rounded text-red-600"
                                                                    title="Cancelar"
                                                                >
                                                                    <X size={8} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
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

                                    {/* Botão de adicionar evento rápido no dia (Hovet) */}
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

                {/* Exibição para Mobile (Lista de Cards) */}
                <div className="lg:hidden flex-1 overflow-y-auto bg-[var(--bg-main)] p-4 space-y-4 min-h-[400px]">
                    {calendarDays
                        .filter(day => isSameMonth(day, currentMonth))
                        .map((day) => {
                            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div key={day.toString()} className="space-y-2">
                                    {/* Cabeçalho do Dia */}
                                    <div className={clsx(
                                        "flex items-center justify-between px-2 py-1 sticky top-0 z-10 backdrop-blur-sm",
                                        isToday ? "bg-primary-500/10 rounded-lg text-primary-700" : "text-[var(--text-muted)]"
                                    )}>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl font-black">{format(day, 'dd')}</span>
                                            <span className="text-xs font-bold uppercase opacity-60">{format(day, 'EEE', { locale: ptBR })}</span>
                                        </div>
                                        <button
                                            onClick={() => navigate('/events/new', { state: { initialDate: day.toISOString() } })}
                                            className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                                            title="Novo Evento"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Lista de Eventos ou Placeholder */}
                                    <div className="space-y-3 pl-4 border-l-2 border-[var(--border-main)] ml-3">
                                        {dayEvents.length === 0 ? (
                                            <div onClick={() => navigate('/events/new', { state: { initialDate: day.toISOString() } })} className="py-4 px-3 rounded-xl border border-dashed border-[var(--border-main)] text-[var(--text-muted)] text-xs font-medium flex items-center justify-center cursor-pointer hover:bg-[var(--bg-sidebar)] transition-colors opacity-60 hover:opacity-100">
                                                Toque para adicionar evento
                                            </div>
                                        ) : (
                                            dayEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => handleEventClick(event)}
                                                    className={clsx(
                                                        "bg-[var(--bg-sidebar)] rounded-xl border border-[var(--border-main)] shadow-sm p-3 active:scale-[0.98] transition-all relative overflow-hidden group/mobile-card",
                                                        event.status === 'cancelled' && "opacity-60 grayscale"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute left-0 top-0 bottom-0 w-1",
                                                        event.status === 'confirmed' ? "bg-green-500" :
                                                            event.status === 'pending' ? "bg-yellow-500" :
                                                                "bg-red-500"
                                                    )}></div>

                                                    <div className="ml-2 flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-xs font-black text-[var(--text-muted)] uppercase">{format(parseISO(event.date), 'HH:mm')}</span>
                                                                <h4 className="text-sm font-bold text-[var(--text-main)] truncate">{event.artists?.name}</h4>
                                                            </div>
                                                            <div className="flex items-center text-[11px] text-[var(--text-muted)] font-medium">
                                                                <MapPin size={10} className="mr-1" />
                                                                <span className="truncate">{event.venue_name || event.city}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {/* Mobile Quick Actions */}
                                                            {(user?.role === 'admin' || user?.role === 'producer') && (
                                                                <div className="flex items-center space-x-2 mr-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate('/events/new', { state: { initialDate: event.date } });
                                                                        }}
                                                                        className="p-1.5 bg-primary-50 text-primary-600 rounded-full"
                                                                        title="Novo Evento"
                                                                    >
                                                                        <Plus size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleEditClick(e, event.id)}
                                                                        className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[var(--text-main)]"
                                                                    >
                                                                        <Edit2 size={12} />
                                                                    </button>
                                                                    {event.status !== 'confirmed' && (
                                                                        <button
                                                                            onClick={(e) => handleStatusUpdate(e, event.id, 'confirmed')}
                                                                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full"
                                                                        >
                                                                            <Check size={12} />
                                                                        </button>
                                                                    )}
                                                                    {event.status !== 'cancelled' && (
                                                                        <button
                                                                            onClick={(e) => handleStatusUpdate(e, event.id, 'cancelled')}
                                                                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {event.artists?.logo_url && (
                                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] overflow-hidden border border-[var(--border-main)] flex-shrink-0">
                                                                    <img src={event.artists.logo_url} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    {calendarDays.filter(day => isSameMonth(day, currentMonth)).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <CalendarIcon size={48} className="text-[var(--text-muted)] opacity-20 mb-4" />
                            <p className="text-[var(--text-main)] font-black">Mês vazio</p>
                        </div>
                    )}
                </div>

                {/* Legenda de Cores de Status no Rodapé */}
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
