import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import {
    Users, Truck, Info, Clock,
    Save, X, FileText, Upload,
    Hotel, Mic2
} from 'lucide-react';
import { maskPhone } from '../utils/format';
import clsx from 'clsx';
// import { useAuth } from '../context/AuthContext';

interface Artist { id: string; name: string; }
interface Contractor { id: string; name: string; }

interface ContactField {
    name: string;
    phone: string;
}

const ContactInput = ({ label, value, onChange }: { label: string, value: ContactField | string, onChange: (val: ContactField) => void }) => {
    // Ensure value is an object
    const contact = typeof value === 'string' ? { name: value, phone: '' } : (value || { name: '', phone: '' });

    const handleNameChange = (name: string) => {
        onChange({ ...contact, name });
    };

    const handlePhoneChange = (phone: string) => {
        onChange({ ...contact, phone: maskPhone(phone) });
    };

    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase truncate block" title={label}>{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Nome"
                    value={contact.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="input-field flex-1 min-w-0" // min-w-0 prevents flex item from overflowing
                />
                <input
                    type="text"
                    placeholder="Telefone"
                    value={contact.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="input-field w-32 sm:w-40"
                />
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }: any) => {
    const handleChange = (val: string) => {
        if (label?.toLowerCase().includes('telefone') || placeholder?.toLowerCase().includes('telefone') || label?.toLowerCase().includes('contato')) {
            onChange(maskPhone(val));
        } else {
            onChange(val);
        }
    };

    return (
        <div className="space-y-1 flex-1">
            {label && <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{label}</label>}
            <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className="input-field"
            />
        </div>
    );
};

export const NewEvent = () => {
    const navigate = useNavigate();
    // const { user } = useAuth(); // Removed as it was only used for status check which is now gone
    const { id } = useParams(); // Get ID if editing
    const [activeTab, setActiveTab] = useState('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        artist_id: '',
        contractor_id: '',
        date: '',
        city: '',
        state: '',
        venue_name: '',
        event_name: '',
        status: 'pending',
        type: 'show',
        contract_url: '',
        details_contacts: {
            produtor_geral: { name: '', phone: '' },
            produtor_palco: { name: '', phone: '' },
            produtor_tecnico: { name: '', phone: '' },
            assessoria_imprensa: { name: '', phone: '' },
            produtor_financeiro: { name: '', phone: '' },
            diarias_alimentacao: { name: '', phone: '' },
            cortesias: { name: '', phone: '' },
            carregadores: { name: '', phone: '' }
        },
        details_suppliers: {
            sonorizacao: { name: '', phone: '' },
            iluminacao: { name: '', phone: '' },
            led: { name: '', phone: '' },
            palco: { name: '', phone: '' },
            gride: { name: '', phone: '' },
            estrutura_camarim: { name: '', phone: '' },
            abastecimento_camarim: { name: '', phone: '' },
            geradores: { name: '', phone: '' }
        },
        details_transports: {
            responsavel_transporte: { name: '', phone: '' },
            motorista_bau: { name: '', phone: '' },
            motorista_van_tecnica: { name: '', phone: '' },
            motorista_van_banda: { name: '', phone: '' },
            motorista_suv_artista: { name: '', phone: '' }
        },
        details_lodging: {
            contato_hotel: { name: '', phone: '' },
            nome_hotel: { name: '', phone: '' },
            cidade_hospedagem: ''
        },
        details_lineup: {
            atracao1: '',
            atracao2: '',
            atracao3: '',
            atracao4: '',
            atracao5: ''
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const [artistsRes, contractorsRes] = await Promise.all([
                    api.get('/artists'),
                    api.get('/contractors')
                ]);
                setArtists(artistsRes.data);
                setContractors(contractorsRes.data);

                // If editing, fetch event data
                if (id) {
                    // We need an endpoint to get single event or filter list
                    // Usually GET /events/:id. Let's assume it exists or use filter on list if not.
                    // The routes/events.ts has GET / (all) but not GET /:id explicitly shown in previous step?
                    // Wait, routes/events.ts showed:
                    // router.get('/', ...) and router.put('/:id', ...) and router.delete('/:id', ...)
                    // It did NOT show router.get('/:id', ...). I need to check or implement it.
                    // However, I can use the list and find it, or better, implement GET /:id in backend.
                    // For now, I'll try GET /events/:id. If it fails, I might need to fix backend.
                    // Actually, let's assume I need to implement GET /events/:id in backend too.
                    // But I cannot see backend files right now easily. 
                    // Let's try to fetch all and find, or assume GET /events/:id exists (standard REST).
                    // UPDATE: I reviewed routes/events.ts in Step 66. It ONLY had GET / (all). 
                    // It DOES NOT have GET /:id.
                    // I MUST implement GET /:id in backend first or simultaneously.
                    // I will implement fetching via list filtering for now to be safe without backend changes if possible, 
                    // BUT fetching all events to find one is bad practice.
                    // I SHOULD add GET /:id to backend.

                    // Actually, let's check if the existing GET / supports query or if I should just add GET /:id.
                    // I will assume for this step I will Add GET /:id to backend in next step.
                    // For now, write frontend code to call it.
                    const eventRes = await api.get(`/events/${id}`);
                    const event = eventRes.data;

                    // Helper to parse legacy strings into objects
                    const parseDetail = (data: any, defaultStruct: any) => {
                        if (!data) return defaultStruct;
                        const result: any = {};
                        Object.keys(defaultStruct).forEach(key => {
                            const val = data[key];
                            const defaultVal = defaultStruct[key];

                            // If default is string (like cidade_hospedagem), expect string
                            if (typeof defaultVal === 'string') {
                                result[key] = typeof val === 'object' ? (val.name || '') : (val || '');
                            } else {
                                // Default is object {name, phone}
                                if (typeof val === 'string') {
                                    result[key] = { name: val, phone: '' };
                                } else if (val && typeof val === 'object') {
                                    result[key] = val;
                                } else {
                                    result[key] = { name: '', phone: '' };
                                }
                            }
                        });
                        return result;
                    };

                    // Populate form
                    setFormData({
                        artist_id: event.artist_id,
                        contractor_id: event.contractor_id,
                        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '', // format for datetime-local
                        city: event.city,
                        state: event.state,
                        venue_name: event.venue_name || '',
                        event_name: event.event_name || '',
                        status: event.status,
                        type: event.type || 'show',
                        contract_url: event.contract_url || '',
                        details_contacts: parseDetail(event.details_contacts, formData.details_contacts),
                        details_suppliers: parseDetail(event.details_suppliers, formData.details_suppliers),
                        details_transports: parseDetail(event.details_transports, formData.details_transports),
                        details_lodging: parseDetail(event.details_lodging, formData.details_lodging),
                        details_lineup: event.details_lineup || formData.details_lineup
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                alert('Erro ao carregar dados do evento.');
                navigate('/calendar');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fData = new FormData();
        fData.append('file', file);

        try {
            const res = await api.post('/events/upload-contract', fData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, contract_url: res.data.url }));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao fazer upload do contrato.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação Estrita - Todos os campos da aba Informações são obrigatórios
        const requiredFields = [
            { field: formData.artist_id, label: 'Artista' },
            { field: formData.contractor_id, label: 'Contratante' },
            { field: formData.event_name, label: 'Nome do Evento' },
            { field: formData.date, label: 'Data e Hora' },
            { field: formData.venue_name, label: 'Local do Evento (Venue)' },
            { field: formData.city, label: 'Cidade' },
            { field: formData.state, label: 'UF' }
        ];

        const missingFields = requiredFields.filter(f => !f.field || (typeof f.field === 'string' && f.field.trim() === '')).map(f => f.label);

        if (missingFields.length > 0) {
            return alert(`Por favor, preencha todas as informações obrigatórias da aba Evento:\n- ${missingFields.join('\n- ')}`);
        }

        const eventDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bloqueio de datas passadas (apenas para novos registros, permitindo editar existentes se for o caso, 
        // mas o usuário pediu "so deixara incluir se a data for a atual ou pra frente")
        if (!id && eventDate < today) {
            return alert('Não é possível cadastrar eventos em datas passadas.');
        }

        setIsSubmitting(true);
        try {
            if (id) {
                await api.put(`/events/${id}`, formData);
            } else {
                await api.post('/events', formData);
            }
            navigate('/calendar');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao salvar evento.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'info', label: 'Informações', icon: Info },
        { id: 'contacts', label: 'Contatos', icon: Users },
        { id: 'suppliers', label: 'Fornecedores', icon: Mic2 },
        { id: 'transports', label: 'Transporte', icon: Truck },
        { id: 'lodging', label: 'Hospedagem', icon: Hotel },
        { id: 'lineup', label: 'Line-up', icon: Clock },
    ];



    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-[var(--text-main)]">
                <div>
                    <h1 className="text-2xl font-bold">{id ? 'Editar Evento' : 'Novo Agendamento'}</h1>
                    <p className="text-sm text-[var(--text-muted)]">{id ? 'Atualize os dados e detalhes técnicos do evento.' : 'Cadastre um novo evento no sistema.'}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Tabs Navigation (Horizontal) */}
                <div className="w-full bg-[var(--bg-sidebar)] p-1 rounded-xl border border-[var(--border-main)] shadow-sm overflow-x-auto">
                    <div className="flex space-x-1 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                        : "text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]"
                                )}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* File Upload Section (Moved to be less intrusive, or keep in sidebar? moving to form bottom or top) */}
                {/* For horizontal layout, maybe put contract upload inside 'Informações' or a separate mini-header */}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Form Content */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="card p-6">
                            <div className="min-h-[400px]">
                                {activeTab === 'info' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
                                            <h2 className="font-bold text-[var(--text-main)] flex items-center">
                                                <Info size={18} className="mr-2 text-primary-500" /> Informações Gerais
                                            </h2>
                                            {/* Contract Upload Mini Widget */}
                                            <div className="flex items-center space-x-2">
                                                {formData.contract_url ? (
                                                    <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                                                        <FileText size={12} className="mr-1" />
                                                        <a href={formData.contract_url} target="_blank" rel="noreferrer" className="font-bold hover:underline">Contrato Anexado</a>
                                                        <button type="button" onClick={() => setFormData({ ...formData, contract_url: '' })} className="ml-2 text-green-800 hover:text-red-500"><X size={12} /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
                                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-xs flex items-center bg-[var(--bg-main)] hover:bg-[var(--bg-sidebar)] border border-[var(--border-main)] px-3 py-1.5 rounded-lg transition-colors font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                                            <Upload size={12} className="mr-1.5" /> {isUploading ? 'Enviando...' : 'Anexar Contrato (PDF)'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Artista</label>
                                                <select
                                                    required
                                                    value={formData.artist_id}
                                                    onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                                                    className="input-field"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Contratante</label>
                                                <select
                                                    value={formData.contractor_id}
                                                    onChange={(e) => setFormData({ ...formData, contractor_id: e.target.value })}
                                                    className="input-field"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <InputField label="Nome do Evento" value={formData.event_name} onChange={(val: any) => setFormData({ ...formData, event_name: val })} placeholder="Opcional: Nome específico do show" />
                                            <InputField label="Data e Hora" type="datetime-local" required value={formData.date} onChange={(val: any) => setFormData({ ...formData, date: val })} />
                                            <InputField label="Local" value={formData.venue_name} onChange={(val: any) => setFormData({ ...formData, venue_name: val })} placeholder="Ex: Teatro Municipal" />
                                            <div className="flex gap-4">
                                                <div className="flex-1"><InputField label="Cidade" value={formData.city} onChange={(val: any) => setFormData({ ...formData, city: val })} /></div>
                                                <div className="w-28 space-y-1">
                                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">UF</label>
                                                    <select
                                                        value={formData.state}
                                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                        className="input-field"
                                                    >
                                                        <option value="">UF</option>
                                                        {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                            <option key={uf} value={uf}>{uf}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                )}

                                {activeTab === 'contacts' && (
                                    <div className="space-y-6">
                                        <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                            <Users size={18} className="mr-2 text-primary-500" /> Contatos da Produção
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.keys(formData.details_contacts).map((key) => (
                                                <ContactInput
                                                    key={key}
                                                    label={key.replace(/_/g, ' ')}
                                                    value={(formData.details_contacts as any)[key]}
                                                    onChange={(v) => setFormData({ ...formData, details_contacts: { ...formData.details_contacts, [key]: v } })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'suppliers' && (
                                    <div className="space-y-6">
                                        <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                            <Mic2 size={18} className="mr-2 text-primary-500" /> Fornecedores Técnicos
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.keys(formData.details_suppliers).map((key) => (
                                                <ContactInput
                                                    key={key}
                                                    label={key.replace(/_/g, ' ')}
                                                    value={(formData.details_suppliers as any)[key]}
                                                    onChange={(v) => setFormData({ ...formData, details_suppliers: { ...formData.details_suppliers, [key]: v } })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'transports' && (
                                    <div className="space-y-6">
                                        <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                            <Truck size={18} className="mr-2 text-primary-500" /> Logística & Transporte
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.keys(formData.details_transports).map((key) => (
                                                <ContactInput
                                                    key={key}
                                                    label={key.replace(/_/g, ' ')}
                                                    value={(formData.details_transports as any)[key]}
                                                    onChange={(v) => setFormData({ ...formData, details_transports: { ...formData.details_transports, [key]: v } })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'lodging' && (
                                    <div className="space-y-6">
                                        <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                            <Hotel size={18} className="mr-2 text-primary-500" /> Hospedagem
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ContactInput
                                                label="Contato Hotel"
                                                value={(formData.details_lodging as any).contato_hotel}
                                                onChange={(v) => setFormData({ ...formData, details_lodging: { ...formData.details_lodging, contato_hotel: v } })}
                                            />
                                            <ContactInput
                                                label="Nome Hotel"
                                                value={(formData.details_lodging as any).nome_hotel}
                                                onChange={(v) => setFormData({ ...formData, details_lodging: { ...formData.details_lodging, nome_hotel: v } })}
                                            />
                                            <div className="md:col-span-2">
                                                <InputField
                                                    label="Cidade Hospedagem"
                                                    value={(formData.details_lodging as any).cidade_hospedagem}
                                                    onChange={(v: any) => setFormData({ ...formData, details_lodging: { ...formData.details_lodging, cidade_hospedagem: v } })}
                                                    placeholder="Cidade onde será a hospedagem"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'lineup' && (
                                    <div className="space-y-6">
                                        <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                            <Clock size={18} className="mr-2 text-primary-500" /> Line-up / Atrações
                                        </h2>
                                        <div className="space-y-3 max-w-lg">
                                            {[1, 2, 3, 4, 5].map((num) => {
                                                const key = `atracao${num}`;
                                                const value = (formData.details_lineup as any)[key];
                                                // Handle legacy string or new object
                                                const time = typeof value === 'object' ? value?.time || '' : '';
                                                const name = typeof value === 'object' ? value?.name || '' : (typeof value === 'string' ? value : '');

                                                return (
                                                    <div key={num} className="space-y-1">
                                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Atração {num}</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="time"
                                                                className="input-field w-24"
                                                                value={time}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    details_lineup: {
                                                                        ...formData.details_lineup,
                                                                        [key]: { time: e.target.value, name }
                                                                    }
                                                                })}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="input-field flex-1"
                                                                placeholder="Nome do Artista / Banda"
                                                                value={name}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    details_lineup: {
                                                                        ...formData.details_lineup,
                                                                        [key]: { time, name: e.target.value }
                                                                    }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-[var(--border-main)] flex justify-end space-x-3">
                                <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="btn-primary flex items-center space-x-2 shadow-sm"
                                >
                                    <Save size={18} />
                                    <span>{isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Helper / Summary Sidebar (Optional) */}
                    <div className="hidden lg:block space-y-4">
                        <div className="card p-4 bg-[var(--bg-sidebar)]">
                            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Resumo</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between"><span className="text-[var(--text-muted)]">Data:</span> <span className="font-bold">{formData.date ? new Date(formData.date).toLocaleDateString('pt-BR') : '-'}</span></p>
                                <p className="flex justify-between"><span className="text-[var(--text-muted)]">Local:</span> <span className="font-bold text-right truncate ml-2">{formData.venue_name || '-'}</span></p>
                                <p className="flex justify-between"><span className="text-[var(--text-muted)]">Cidade:</span> <span className="font-bold text-right truncate ml-2">{formData.city || '-'}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
