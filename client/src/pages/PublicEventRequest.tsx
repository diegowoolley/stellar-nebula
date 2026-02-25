import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Truck, Info, Clock,
    Save, CheckCircle2, Music,
    Hotel, Mic2
} from 'lucide-react';
import { maskPhone } from '../utils/format';
import clsx from 'clsx';
import { API_URL } from '../config/api';

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
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight block" title={label}>{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Nome"
                    value={contact.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)] placeholder:opacity-40 flex-1 min-w-0"
                />
                <input
                    type="text"
                    placeholder="Telefone"
                    value={contact.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-32 sm:w-40 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)] placeholder:opacity-40"
                />
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }: any) => {
    return (
        <div className="space-y-1 flex-1">
            {label && <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{label}</label>}
            <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)] placeholder:opacity-40"
            />
        </div>
    );
};

export const ExternalRequest = () => {
    const { token } = useParams();
    const [activeTab, setActiveTab] = useState('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [artists, setArtists] = useState<any[]>([]);
    const [contractor, setContractor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        artist_id: '',
        contractor_id: '',
        date: '',
        city: '',
        state: '',
        venue_name: '',
        event_name: '',
        type: 'show',
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
            try {
                // Validar token e buscar dados do contratante
                const contractorRes = await axios.get(`${API_URL}/public/validate-link/${token}`);
                const contractorData = contractorRes.data;

                setContractor(contractorData);
                setFormData(prev => ({ ...prev, contractor_id: contractorData.id }));

                // Buscar artistas
                const artistsRes = await axios.get(`${API_URL}/public/artists`);
                setArtists(artistsRes.data);
            } catch (error) {
                console.error('Erro ao buscar dados ou link expirado:', error);
                setContractor(null); // Garante que mostre erro se falhar
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação estrita frontend
        if (!formData.artist_id) return alert('Por favor, selecione um artista.');
        if (!formData.date) return alert('Por favor, informe a data e hora do evento.');

        const eventDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
            return alert('Não é possível cadastrar eventos em datas passadas.');
        }

        if (!formData.event_name || formData.event_name.length < 3) {
            return alert('O nome do evento é obrigatório e deve ter pelo menos 3 caracteres.');
        }
        if (!formData.venue_name) return alert('O local do evento é obrigatório.');
        if (!formData.city) return alert('Por favor, informe a cidade.');
        if (!formData.state) return alert('Por favor, informe a UF (Estado).');

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/public/event`, {
                ...formData,
                // contractor_id já está no state
            });
            setIsSubmitted(true);
        } catch (error: any) {
            console.error('Erro na submissão:', error.response?.data);

            // Tenta extrair erro detalhado do Zod se disponível
            const serverError = error.response?.data;
            if (serverError?.errors && Array.isArray(serverError.errors)) {
                const messages = serverError.errors.map((e: any) => `${e.path}: ${e.message}`).join('\n');
                alert(`Erro de validação:\n${messages}`);
            } else {
                alert(serverError?.message || serverError?.error || 'Erro ao enviar solicitação. Verifique os campos e tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'info', label: 'Evento', icon: Info },
        { id: 'contacts', label: 'Contatos', icon: Users },
        { id: 'suppliers', label: 'Palco/TE', icon: Mic2 },
        { id: 'transports', label: 'Logística', icon: Truck },
        { id: 'lodging', label: 'Hotel', icon: Hotel },
        { id: 'lineup', label: 'Line-up', icon: Clock },
    ];



    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
            <p className="text-[var(--text-muted)] animate-pulse">Carregando formulário...</p>
        </div>
    );

    if (!contractor) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
            <div className="card p-8 text-center max-w-md">
                <h1 className="text-xl font-bold text-red-600 mb-2">Link Inválido</h1>
                <p className="text-[var(--text-muted)]">Este link de solicitação não é válido ou expirou.</p>
            </div>
        </div>
    );

    if (isSubmitted) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
            <div className="card p-8 text-center max-w-md animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle2 size={32} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">Solicitação Enviada!</h1>
                <p className="text-[var(--text-muted)] mb-6">
                    Obrigado, <strong>{contractor.name}</strong>. Os dados do evento para <strong>{artists.find(a => a.id === formData.artist_id)?.name}</strong> foram recebidos e estão em análise.
                </p>

            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pb-12">
            {/* Public Header */}
            <div className="bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] px-4 py-6 mb-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-main)]">Solicitação de Evento</h1>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Contratante: <span className="font-bold text-primary-600 uppercase">{contractor.name}</span></p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Navigation - Mobile Scroll / Desktop Sidebar */}
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 lg:w-48 flex-shrink-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap lg:w-full",
                                    activeTab === tab.id
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                        : "bg-[var(--bg-sidebar)] text-[var(--text-muted)] border border-[var(--border-main)] hover:border-primary-300"
                                )}
                            >
                                <tab.icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className="flex-1 card overflow-hidden">
                        <div className="p-6">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Info size={16} className="mr-2 text-primary-500" /> Informações do Evento
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Artista</label>
                                            <div className="relative">
                                                <Music size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                                                <select
                                                    required
                                                    value={formData.artist_id}
                                                    onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none text-sm appearance-none text-[var(--text-main)]"
                                                >
                                                    <option value="">Selecione o Artista</option>
                                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <InputField label="Nome do Evento / Turnê" value={formData.event_name} onChange={(val: any) => setFormData({ ...formData, event_name: val })} />
                                        <InputField label="Data e Hora" type="datetime-local" required value={formData.date} onChange={(val: any) => setFormData({ ...formData, date: val })} />
                                        <InputField label="Local (Ex: Estádio, Clube)" value={formData.venue_name} onChange={(val: any) => setFormData({ ...formData, venue_name: val })} />
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="col-span-3"><InputField label="Cidade" value={formData.city} onChange={(val: any) => setFormData({ ...formData, city: val })} /></div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">UF</label>
                                                <select
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)] appearance-none"
                                                >
                                                    <option value="">UF</option>
                                                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                        <option key={uf} value={uf}>{uf}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-primary-500/5 border border-primary-500/10 rounded-lg text-[11px] text-primary-600 font-medium">
                                        Tip: Preencha o máximo de detalhes possível nas próximas abas para agilizar a aprovação.
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contacts' && (
                                <div className="space-y-6">
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Users size={16} className="mr-2 text-primary-500" /> Contatos da Produção Local
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
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Mic2 size={16} className="mr-2 text-primary-500" /> Estrutura e Fornecedores
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
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Truck size={16} className="mr-2 text-primary-500" /> Logística de Transporte
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
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Hotel size={16} className="mr-2 text-primary-500" /> Hospedagem
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
                                    <h2 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2 flex items-center">
                                        <Clock size={16} className="mr-2 text-primary-500" /> Programação Estimada
                                    </h2>
                                    <div className="space-y-3 max-w-lg">
                                        {[1, 2, 3, 4, 5].map((num) => {
                                            const key = `atracao${num}`;
                                            const value = (formData.details_lineup as any)[key];
                                            const time = typeof value === 'object' ? value?.time || '' : '';
                                            const name = typeof value === 'object' ? value?.name || '' : (typeof value === 'string' ? value : '');

                                            return (
                                                <div key={num} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Atração {num}</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="time"
                                                            className="w-24 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)]"
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
                                                            className="flex-1 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-[var(--text-main)] placeholder:opacity-40"
                                                            placeholder="Nome do Artista"
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

                        {/* Public Footer */}
                        <div className="p-6 bg-[var(--bg-main)] border-t border-[var(--border-main)] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] text-[var(--text-muted)] text-center sm:text-left font-medium">
                                Ao enviar, você declara que os dados são verídicos.<br />A solicitação será analisada pela nossa equipe.
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-10 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>Enviando...</>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Enviar Solicitação</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
