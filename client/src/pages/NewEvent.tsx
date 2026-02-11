import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Users, Truck, Info, Clock,
    Save, X, FileText, Upload,
    Hotel, Mic2
} from 'lucide-react';
import { maskPhone } from '../utils/format';
import clsx from 'clsx';

interface Artist { id: string; name: string; }
interface Contractor { id: string; name: string; }

export const NewEvent = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
            produtor_geral: '',
            produtor_palco: '',
            produtor_tecnico: '',
            assessoria_imprensa: '',
            produtor_financeiro: '',
            diarias_alimentacao: '',
            cortesias: '',
            carregadores: ''
        },
        details_suppliers: {
            sonorizacao: '',
            iluminacao: '',
            led: '',
            palco: '',
            gride: '',
            estrutura_camarim: '',
            abastecimento_camarim: '',
            geradores: ''
        },
        details_transports: {
            responsavel_transporte: '',
            motorista_bau: '',
            motorista_van_tecnica: '',
            motorista_van_banda: '',
            motorista_suv_artista: ''
        },
        details_lodging: {
            contato_hotel: '',
            nome_hotel: '',
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
                const [artistsRes, contractorsRes] = await Promise.all([
                    api.get('/artists'),
                    api.get('/contractors')
                ]);
                setArtists(artistsRes.data);
                setContractors(contractorsRes.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);

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
        if (!formData.artist_id || !formData.date || !formData.city) {
            return alert('Preencha os campos obrigatórios (Artista, Data e Cidade).');
        }

        const eventDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return alert('Não é possível cadastrar eventos em datas passadas.');
        }

        setIsSubmitting(true);
        try {
            await api.post('/events', formData);
            navigate('/calendar');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao criar evento.');
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

    const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }: any) => {
        const handleChange = (val: string) => {
            if (label?.toLowerCase().includes('telefone') || placeholder?.toLowerCase().includes('telefone') || label?.toLowerCase().includes('contato')) {
                handleChangeMask(val);
            } else {
                onChange(val);
            }
        };

        const handleChangeMask = (val: string) => {
            onChange(maskPhone(val));
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-[var(--text-main)]">
                <div>
                    <h1 className="text-2xl font-bold">Novo Agendamento</h1>
                    <p className="text-sm text-[var(--text-muted)]">Cadastre um novo evento no sistema.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs Navigation */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                activeTab === tab.id
                                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                    : "text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]"
                            )}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}

                    <div className="mt-6 pt-6 border-t border-[var(--border-main)]">
                        <div className="p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)]">
                            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-widest">Contrato (PDF)</h4>
                            {formData.contract_url ? (
                                <div className="flex items-center justify-between text-[var(--text-main)] bg-[var(--bg-sidebar)] p-2 rounded border border-[var(--border-main)] shadow-sm">
                                    <div className="flex items-center overflow-hidden">
                                        <FileText size={14} className="mr-2 text-primary-500 flex-shrink-0" />
                                        <span className="text-xs truncate font-medium">Anexado</span>
                                    </div>
                                    <button onClick={() => setFormData({ ...formData, contract_url: '' })} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full py-2 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] flex items-center justify-center space-x-2 transition-all shadow-sm"
                                >
                                    {isUploading ? 'Subindo...' : <><Upload size={14} /> <span>Subir PDF</span></>}
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 card p-6">
                    <div className="min-h-[400px]">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                    <Info size={18} className="mr-2 text-primary-500" /> Geral
                                </h2>
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
                                    <InputField label="Nome do Evento" value={formData.event_name} onChange={(val: any) => setFormData({ ...formData, event_name: val })} />
                                    <InputField label="Data e Hora" type="datetime-local" required value={formData.date} onChange={(val: any) => setFormData({ ...formData, date: val })} />
                                    <InputField label="Local (Venue)" value={formData.venue_name} onChange={(val: any) => setFormData({ ...formData, venue_name: val })} />
                                    <div className="flex gap-4">
                                        <InputField label="Cidade" value={formData.city} onChange={(val: any) => setFormData({ ...formData, city: val })} />
                                        <div className="w-20"><InputField label="UF" value={formData.state} onChange={(val: any) => setFormData({ ...formData, state: val })} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contacts' && (
                            <div className="space-y-6">
                                <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                    <Users size={18} className="mr-2 text-primary-500" /> Contatos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(formData.details_contacts).map((key) => (
                                        <InputField
                                            key={key}
                                            label={key.replace(/_/g, ' ')}
                                            value={(formData.details_contacts as any)[key]}
                                            onChange={(v: any) => setFormData({ ...formData, details_contacts: { ...formData.details_contacts, [key]: v } })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'suppliers' && (
                            <div className="space-y-6">
                                <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                    <Mic2 size={18} className="mr-2 text-primary-500" /> Fornecedores
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(formData.details_suppliers).map((key) => (
                                        <InputField
                                            key={key}
                                            label={key.replace(/_/g, ' ')}
                                            value={(formData.details_suppliers as any)[key]}
                                            onChange={(v: any) => setFormData({ ...formData, details_suppliers: { ...formData.details_suppliers, [key]: v } })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'transports' && (
                            <div className="space-y-6">
                                <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                    <Truck size={18} className="mr-2 text-primary-500" /> Transports
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(formData.details_transports).map((key) => (
                                        <InputField
                                            key={key}
                                            label={key.replace(/_/g, ' ')}
                                            value={(formData.details_transports as any)[key]}
                                            onChange={(v: any) => setFormData({ ...formData, details_transports: { ...formData.details_transports, [key]: v } })}
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
                                    {Object.keys(formData.details_lodging).map((key) => (
                                        <InputField
                                            key={key}
                                            label={key.replace(/_/g, ' ')}
                                            value={(formData.details_lodging as any)[key]}
                                            onChange={(v: any) => setFormData({ ...formData, details_lodging: { ...formData.details_lodging, [key]: v } })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'lineup' && (
                            <div className="space-y-6">
                                <h2 className="font-bold text-[var(--text-main)] flex items-center border-b border-[var(--border-main)] pb-2">
                                    <Clock size={18} className="mr-2 text-primary-500" /> Line-up
                                </h2>
                                <div className="space-y-3 max-w-md">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <InputField
                                            key={num}
                                            label={`Atração ${num}`}
                                            value={(formData.details_lineup as any)[`atracao${num}`]}
                                            onChange={(val: any) => setFormData({
                                                ...formData,
                                                details_lineup: { ...formData.details_lineup, [`atracao${num}`]: val }
                                            })}
                                        />
                                    ))}
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
        </div>
    );
};
