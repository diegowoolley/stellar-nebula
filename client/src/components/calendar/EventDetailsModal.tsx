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
    XCircle,
    Check
} from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventData | null;
    onUpdate?: () => void;
    onEventUpdate?: (updatedEvent: any) => void;
}

interface EventDetails {
    [key: string]: string | number | null;
}

interface EventData {
    id: string;
    artist_id: string;
    contractor_id?: string;
    city: string;
    state?: string;
    venue_name?: string;
    date: string;
    type?: string;
    status: string;
    event_name?: string;
    contract_url?: string;
    created_at?: string;
    updated_at?: string;
    artists?: { name: string; logo_url: string };
    contractors?: { name: string };
    details_contacts?: EventDetails;
    details_suppliers?: EventDetails;
    details_transports?: EventDetails;
    details_lodging?: EventDetails;
    details_lineup?: EventDetails;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event, onUpdate, onEventUpdate }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = React.useState('info');
    const [isUpdating, setIsUpdating] = React.useState(false);

    // Reset tab to 'info' when modal opens
    React.useEffect(() => {
        if (isOpen) setActiveTab('info');
    }, [isOpen]);

    if (!isOpen || !event) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!event || isUpdating) return;

        const statusLabel = newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'pending' ? 'Pendente' : 'Cancelado';
        if (!confirm(`Deseja alterar o status para ${statusLabel}?`)) return;

        try {
            setIsUpdating(true);
            const response = await api.put(`/events/${event.id}`, { status: newStatus });

            if (response.data) {
                if (onEventUpdate) onEventUpdate(response.data);
                if (onUpdate) onUpdate();
            }
        } catch (error: any) {
            console.error('Erro ao atualizar status do evento:', error);
            const errorMessage = error.response?.data?.error || 'Não foi possível atualizar o status do evento.';
            alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
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

    const tabs = [
        { id: 'info', label: 'Geral', icon: FileText },
        { id: 'contacts', label: 'Contatos', icon: User },
        { id: 'suppliers', label: 'Técnica', icon: Briefcase }, // Using Briefcase as generic, or import Mic2
        { id: 'transports', label: 'Logística', icon: Briefcase }, // Using Briefcase or maybe MapPin?
        { id: 'lodging', label: 'Hospedagem', icon: Briefcase }, // Using Briefcase
        { id: 'lineup', label: 'Line-up', icon: Clock },
    ];

    const FIELD_LABELS: Record<string, string> = {
        // Contatos
        produtor_geral: 'Produtor Geral',
        produtor_palco: 'Produtor de Palco',
        produtor_tecnico: 'Produtor Técnico',
        assessoria_imprensa: 'Assessoria de Imprensa',
        produtor_financeiro: 'Produtor Financeiro',
        diarias_alimentacao: 'Diárias / Alimentação',
        cortesias: 'Cortesias',
        carregadores: 'Carregadores',
        // Fornecedores
        sonorizacao: 'Sonorização',
        iluminacao: 'Iluminação',
        led: 'Painel de LED',
        palco: 'Palco',
        gride: 'Gride',
        estrutura_camarim: 'Estrutura de Camarim',
        abastecimento_camarim: 'Catering / Camarim',
        geradores: 'Geradores',
        // Transporte
        responsavel_transporte: 'Resp. Transporte',
        motorista_bau: 'Motorista Baú',
        motorista_van_tecnica: 'Motorista Van Técnica',
        motorista_van_banda: 'Motorista Van Banda',
        motorista_suv_artista: 'Motorista SUV Artista',
        // Hospedagem
        contato_hotel: 'Contato Hotel',
        nome_hotel: 'Nome do Hotel',
        cidade_hospedagem: 'Cidade Hospedagem',
        // Lineup
        atracao1: 'Atração 1',
        atracao2: 'Atração 2',
        atracao3: 'Atração 3',
        atracao4: 'Atração 4',
        atracao5: 'Atração 5'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-[var(--bg-sidebar)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none">

                {/* Header */}
                <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-sidebar)] print:hidden shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500/10 text-primary-600 rounded-xl flex items-center justify-center border border-primary-500/20">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Detalhes do Evento</h3>
                            <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">
                                {user?.role === 'admin' ? 'Gerenciamento Administrativo' : 'Visualização somente leitura'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 p-2 px-3 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-all border border-primary-200"
                            title="Exportar como PDF"
                        >
                            <Printer size={18} />
                            <span className="text-xs font-bold">PDF</span>
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
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tighter">DW<span className="text-primary-600">SISTEMAS</span></h1>
                    <p className="text-sm font-bold text-secondary-500 uppercase tracking-[0.2em] mt-2">Relatório Detalhado de Agendamento</p>
                </div>

                {/* Tabs Navigation */}
                <div className="px-6 pt-2 bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] overflow-x-auto print:hidden shrink-0">
                    <div className="flex space-x-1 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-900/10"
                                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-main)]"
                                )}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto flex-1 print:max-h-none print:p-0 print:overflow-visible">

                    {/* Always visible header info (Artist & Date) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-main)] print:border-none">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-xl bg-secondary-100 border border-[var(--border-main)] overflow-hidden flex-shrink-0">
                                {event.artists?.logo_url ? (
                                    <img src={event.artists.logo_url} alt={event.artists.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                {event.event_name && (
                                    <p className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-0.5">{event.event_name}</p>
                                )}
                                <h2 className="text-xl font-bold text-[var(--text-main)] leading-tight mb-1">{event.artists?.name || 'Artista não definido'}</h2>
                                <div className={clsx(
                                    "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
                                    statusInfo.color
                                )}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.label}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center text-primary-600 font-bold mb-1">
                                <CalendarIcon size={16} className="mr-2" />
                                {format(parseISO(event.date), "dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div className="flex items-center text-[var(--text-muted)] text-sm">
                                <Clock size={14} className="mr-2" />
                                {format(parseISO(event.date), "EEEE, HH:mm'h'", { locale: ptBR })}
                            </div>
                        </div>
                    </div>

                    {/* Tab Content - Print All Logic */}
                    <div className="min-h-[300px] print:min-h-0">
                        {/* INFO GERAL */}
                        <div className={clsx(activeTab === 'info' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Informações Gerais</h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
                                    <div className="space-y-4">
                                        <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2">
                                            <MapPin size={14} className="mr-2 text-primary-500" /> Localização
                                        </h4>
                                        <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-main)] print:border-gray-200">
                                            <p className="text-lg font-bold text-[var(--text-main)]">{event.venue_name || 'Local não especificado'}</p>
                                            <p className="text-[var(--text-muted)]">{event.city}, {event.state}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2">
                                            <Briefcase size={14} className="mr-2 text-primary-500" /> Contratante & Contrato
                                        </h4>
                                        <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-main)] space-y-3 print:border-gray-200">
                                            <div>
                                                <p className="text-lg font-bold text-[var(--text-main)]">{event.contractors?.name || 'Contratante não definido'}</p>
                                                <p className="text-[var(--text-muted)] text-sm">Responsável legal</p>
                                            </div>
                                            {event.contract_url && (
                                                <div className="pt-3 border-t border-[var(--border-main)] print:hidden">
                                                    <a
                                                        href={event.contract_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-full px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-all border border-primary-200 font-bold text-sm"
                                                    >
                                                        <FileText size={16} className="mr-2" />
                                                        Visualizar Contrato Anexado
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Metadados</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-main)] p-3 rounded border border-[var(--border-main)] print:border-gray-200">
                                        <div>
                                            <span className="block font-bold mb-1">ID Evento</span>
                                            <span className="select-all">{event.id}</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold mb-1">Tipo</span>
                                            <span className="capitalize">{event.type}</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold mb-1">Criado em</span>
                                            <span>{format(parseISO(event.created_at || new Date().toISOString()), "dd/MM/yy HH:mm")}</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold mb-1">Última Atualização</span>
                                            <span>{event.updated_at ? format(parseISO(event.updated_at), "dd/MM/yy HH:mm") : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTATOS */}
                        <div className={clsx(activeTab === 'contacts' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:mt-8")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Contatos</h3>

                            <div className="space-y-6">
                                <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2 mb-4 print:hidden">
                                    <User size={14} className="mr-2 text-primary-500" /> Produção & Equipe
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                                    {[
                                        'produtor_geral', 'produtor_palco', 'produtor_tecnico', 'assessoria_imprensa',
                                        'produtor_financeiro', 'diarias_alimentacao', 'cortesias', 'carregadores'
                                    ].map((key) => {
                                        const val = (event.details_contacts as any)?.[key];
                                        const display = typeof val === 'object' && val !== null ? (
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{val.name || '-'}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{val.phone || ''}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-[var(--text-main)] text-right pl-2">{val || '-'}</span>
                                        );

                                        return (
                                            <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded border border-[var(--border-main)] print:border-gray-200">
                                                <span className="text-xs font-bold text-[var(--text-muted)] capitalize">{FIELD_LABELS[key] || key.replace(/_/g, ' ')}</span>
                                                {display}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* FORNECEDORES */}
                        <div className={clsx(activeTab === 'suppliers' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:mt-8")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Fornecedores Técnicos</h3>

                            <div className="space-y-6">
                                <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2 mb-4 print:hidden">
                                    <Briefcase size={14} className="mr-2 text-primary-500" /> Fornecedores Técnicos
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                                    {[
                                        'sonorizacao', 'iluminacao', 'led', 'palco', 'gride',
                                        'estrutura_camarim', 'abastecimento_camarim', 'geradores'
                                    ].map((key) => {
                                        const val = (event.details_suppliers as any)?.[key];
                                        const display = typeof val === 'object' && val !== null ? (
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{val.name || '-'}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{val.phone || ''}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-[var(--text-main)] text-right pl-2">{val || '-'}</span>
                                        );

                                        return (
                                            <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded border border-[var(--border-main)] print:border-gray-200">
                                                <span className="text-xs font-bold text-[var(--text-muted)] capitalize">{FIELD_LABELS[key] || key.replace(/_/g, ' ')}</span>
                                                {display}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* TRANSPORTES */}
                        <div className={clsx(activeTab === 'transports' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:mt-8")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Logística e Transporte</h3>

                            <div className="space-y-6">
                                <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2 mb-4 print:hidden">
                                    <Briefcase size={14} className="mr-2 text-primary-500" /> Logística
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                                    {[
                                        'responsavel_transporte', 'motorista_bau', 'motorista_van_tecnica',
                                        'motorista_van_banda', 'motorista_suv_artista'
                                    ].map((key) => {
                                        const val = (event.details_transports as any)?.[key];
                                        const display = typeof val === 'object' && val !== null ? (
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{val.name || '-'}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{val.phone || ''}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-[var(--text-main)] text-right pl-2">{val || '-'}</span>
                                        );

                                        return (
                                            <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded border border-[var(--border-main)] print:border-gray-200">
                                                <span className="text-xs font-bold text-[var(--text-muted)] capitalize">{FIELD_LABELS[key] || key.replace(/_/g, ' ')}</span>
                                                {display}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* HOSPEDAGEM */}
                        <div className={clsx(activeTab === 'lodging' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:mt-8")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Hospedagem</h3>

                            <div className="space-y-6">
                                <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2 mb-4 print:hidden">
                                    <Briefcase size={14} className="mr-2 text-primary-500" /> Hospedagem
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                                    {[
                                        'contato_hotel', 'nome_hotel', 'cidade_hospedagem'
                                    ].map((key) => {
                                        const val = (event.details_lodging as any)?.[key];
                                        const display = typeof val === 'object' && val !== null ? (
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{val.name || '-'}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{val.phone || ''}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-[var(--text-main)] text-right pl-2">{val || '-'}</span>
                                        );

                                        return (
                                            <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded border border-[var(--border-main)] print:border-gray-200">
                                                <span className="text-xs font-bold text-[var(--text-muted)] capitalize">{FIELD_LABELS[key] || key.replace(/_/g, ' ')}</span>
                                                {display}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* LINEUP */}
                        <div className={clsx(activeTab === 'lineup' ? 'block' : 'hidden print:block', "animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:mt-8")}>
                            {/* Header for print only */}
                            <h3 className="hidden print:block text-lg font-bold mb-4 border-b border-gray-300 pb-2 uppercase text-gray-700">Line-up</h3>

                            <div className="space-y-6">
                                <h4 className="flex items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-main)] pb-2 mb-4 print:hidden">
                                    <Clock size={14} className="mr-2 text-primary-500" /> Line-up / Horários
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'atracao1', 'atracao2', 'atracao3', 'atracao4', 'atracao5'
                                    ].map((key) => {
                                        const val = (event.details_lineup as any)?.[key];
                                        let display = '-';

                                        if (typeof val === 'string' && val.trim()) {
                                            display = val; // Legacy support
                                        } else if (typeof val === 'object' && val !== null) {
                                            const time = val.time || '';
                                            const name = val.name || '';
                                            if (time || name) {
                                                display = time && name ? `${time}h - ${name}` : (time ? `${time}h` : name);
                                            }
                                        }

                                        return (
                                            <div key={key} className="flex justify-between items-center p-3 bg-[var(--bg-main)] rounded border border-[var(--border-main)] print:border-gray-200">
                                                <span className="text-xs font-bold text-[var(--text-muted)] capitalize">{FIELD_LABELS[key] || key.replace(/(\D+)(\d+)/, '$1 $2')}</span>
                                                <span className="text-sm font-semibold text-[var(--text-main)]">{display}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-[var(--bg-main)] border-t border-[var(--border-main)] flex justify-between items-center print:hidden shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        Fechar
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 px-5 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-100 transition-all border border-primary-200"
                        >
                            <Printer size={18} />
                            <span>Imprimir</span>
                        </button>

                        {!isBefore(parseISO(event.date), startOfDay(new Date())) && user?.role === 'admin' && event.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    disabled={isUpdating}
                                    className="flex items-center space-x-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    <span>Recusar</span>
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('confirmed')}
                                    disabled={isUpdating}
                                    className="flex items-center space-x-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                                >
                                    <Check size={18} />
                                    <span>Confirmar Evento</span>
                                </button>
                            </>
                        )}

                        {!isBefore(parseISO(event.date), startOfDay(new Date())) && user?.role === 'admin' && event.status === 'confirmed' && (
                            <button
                                onClick={() => handleStatusUpdate('cancelled')}
                                disabled={isUpdating}
                                className="flex items-center space-x-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50"
                            >
                                <XCircle size={18} />
                                <span>Cancelar Agendamento</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Print Only Footer */}
                <div className="hidden print:block text-center mt-12 pt-8 border-t border-secondary-100 text-[10px] text-secondary-400">
                    Relatório gerado automaticamente pelo sistema Dw Sistemas em {format(new Date(), "dd/MM/yyyy HH:mm:ss")}.
                </div>


            </div>
        </div>
    );
};
