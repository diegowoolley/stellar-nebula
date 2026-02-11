import React from 'react';
import {
    X,
    Printer,
    FileText,
    MapPin,
    Calendar as CalendarIcon,
    Clock,
    User,
    Briefcase,
    CheckCircle2,
    Clock3,
    XCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any; // Simplified for now, can be typed strictly
    onUpdate?: () => void;
    onEventUpdate?: (updatedEvent: any) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event, onUpdate, onEventUpdate }) => {
    const { user } = useAuth();
    const [isUpdating, setIsUpdating] = React.useState(false);

    if (!isOpen || !event) return null;

    const isAdmin = user?.role === 'admin';

    const handleStatusChange = async (newStatus: string) => {
        if (!isAdmin || isUpdating) return;

        setIsUpdating(true);
        try {
            await axios.put(`http://localhost:5000/api/events/${event.id}`, {
                status: newStatus
            });
            if (onEventUpdate) onEventUpdate({ ...event, status: newStatus });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar status do evento:', error);
            alert('Falha ao atualizar o status do evento.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { label: 'Confirmado', icon: <CheckCircle2 size={16} />, color: 'text-green-600 bg-green-50 border-green-200' };
            case 'pending':
                return { label: 'Pendente / Reserva', icon: <Clock3 size={16} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
            case 'cancelled':
                return { label: 'Cancelado', icon: <XCircle size={16} />, color: 'text-red-600 bg-red-500/10 border-red-500/20' };
            default:
                return { label: status, icon: null, color: 'text-[var(--text-muted)] bg-[var(--bg-main)] border-[var(--border-main)]' };
        }
    };

    const statusInfo = getStatusInfo(event.status);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[var(--bg-sidebar)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-sidebar)] print:hidden">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500/10 text-primary-600 rounded-xl flex items-center justify-center border border-primary-500/20">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Detalhes do Evento</h3>
                            <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Visualização somente leitura</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-all"
                            title="Imprimir / Exportar PDF"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print:flex flex-col items-center justify-center p-8 border-b-2 border-secondary-100 mb-8">
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tighter">STELLAR<span className="text-primary-600">NEBULA</span></h1>
                    <p className="text-sm font-bold text-secondary-500 uppercase tracking-[0.2em] mt-2">Relatório Detalhado de Agendamento</p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[85vh] print:max-h-none print:p-0">
                    {/* Artista & Status Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-secondary-50">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-2xl bg-secondary-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                                {event.artists?.logo_url ? (
                                    <img src={event.artists.logo_url} alt={event.artists.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] leading-tight mb-1">{event.artists?.name || 'Artista não definido'}</h2>
                                {isAdmin ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[
                                            { id: 'confirmed', label: 'Confirmar', icon: <CheckCircle2 size={12} />, color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
                                            { id: 'pending', label: 'Pendente', icon: <Clock3 size={12} />, color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
                                            { id: 'cancelled', label: 'Cancelar', icon: <XCircle size={12} />, color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' }
                                        ].map(status => (
                                            <button
                                                key={status.id}
                                                onClick={() => handleStatusChange(status.id)}
                                                disabled={isUpdating || event.status === status.id}
                                                className={clsx(
                                                    "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    status.color,
                                                    event.status === status.id ? "ring-2 ring-primary-500 opacity-100" : "opacity-60 grayscale hover:grayscale-0"
                                                )}
                                            >
                                                {status.icon}
                                                <span>{status.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={clsx(
                                        "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
                                        statusInfo.color
                                    )}>
                                        {statusInfo.icon}
                                        <span>{statusInfo.label}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-main)] flex flex-col justify-center items-center md:items-end min-w-[200px]">
                            <div className="flex items-center text-primary-600 font-black text-xl mb-1">
                                <CalendarIcon size={18} className="mr-2" />
                                {format(parseISO(event.date), "dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div className="flex items-center text-[var(--text-muted)] font-bold text-sm">
                                <Clock size={16} className="mr-2" />
                                {format(parseISO(event.date), "EEEE, HH:mm'h'", { locale: ptBR })}
                            </div>
                        </div>
                    </div>

                    {/* Detalhes de Localização e Contrato */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Coluna 1: Onde e Quem */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="flex items-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                    <MapPin size={12} className="mr-2" /> Localização
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-[var(--text-main)]">{event.venue_name || 'Venu não especificado'}</p>
                                    <p className="text-[var(--text-muted)]">{event.city}, {event.state}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                    <Briefcase size={12} className="mr-2" /> Realização / Contratante
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-[var(--text-main)]">{event.contractors?.name || 'Contratante não definido'}</p>
                                    <p className="text-[var(--text-muted)] text-sm">Responsável pelo evento no local.</p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Informações Técnicas */}
                        <div className="space-y-6">
                            <div className="space-y-3 p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] border-dashed">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Tipo de Agendamento</h4>
                                <p className="text-lg font-bold text-[var(--text-main)] capitalize">{event.type || 'Show'}</p>
                                <div className="h-px bg-[var(--border-main)]"></div>
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-4">Data do Cadastro</h4>
                                <p className="text-sm text-[var(--text-muted)] italic">
                                    Registrado em {format(parseISO(event.created_at || new Date().toISOString()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notas / Observações (Placeholder for now) */}
                    <div className="pt-6 border-t border-[var(--border-main)]">
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Observações do Agendamento</h4>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">
                            Este documento serve como comprovante de agendamento interno para fins de logística e controle de agenda.
                            Informações sujeitas a alterações sem aviso prévio.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-[var(--bg-main)] border-t border-[var(--border-main)] flex justify-between items-center print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        Fechar Visualização
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-sm"
                        >
                            <Printer size={18} />
                            <span>Imprimir</span>
                        </button>
                    </div>
                </div>

                {/* Print Only Footer */}
                <div className="hidden print:block text-center mt-12 pt-8 border-t border-secondary-100 text-[10px] text-secondary-400">
                    Relatório gerado automaticamente pelo sistema Stellar Nebula em {format(new Date(), "dd/MM/yyyy HH:mm:ss")}.
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { position: absolute; left: 0; top: 0; width: 100%; }
                    
                    /* Force modal to be visible and standard layout */
                    .relative.w-full.max-w-2xl { 
                        visibility: visible !important;
                        position: static !important;
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .relative.w-full.max-w-2xl * { visibility: visible !important; }
                    .fixed.inset-0 { position: static !important; }
                    .bg-secondary-900/60 { display: none !important; }
                }
            `}</style>
        </div>
    );
};
