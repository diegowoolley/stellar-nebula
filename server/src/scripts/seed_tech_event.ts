import { supabase } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    console.log('🌱 Starting Mass Seed for ALL Artists...');

    try {
        // 1. Fetch ALL Artists
        const { data: artists, error: artistError } = await supabase
            .from('artists')
            .select('id, name')
            .order('name');

        if (artistError || !artists || artists.length === 0) {
            console.error('❌ No artists found or error fetching artists:', artistError);
            return;
        }

        console.log(`✅ Found ${artists.length} artists. Preparing to seed events...`);

        // Get or Create Contractor
        let { data: contractor } = await supabase.from('contractors').select('id').limit(1).single();
        if (!contractor) {
            const { data: newContractor } = await supabase.from('contractors').insert({ name: 'Prefeitura Municipal de Teste' }).select().single();
            contractor = newContractor;
        }

        // Get User
        const { data: users } = await supabase.from('users').select('id').limit(1);
        const userId = users?.[0]?.id;

        if (!userId) {
            console.error('❌ No user found to attach events.');
            return;
        }

        // Helper to generate random future date
        const getRandomDate = (index: number) => {
            const date = new Date();
            date.setDate(date.getDate() + (index * 2) + 1); // Every other day starting tomorrow
            date.setHours(20, 0, 0, 0);
            return date.toISOString();
        };

        // 2. Loop through ALL artists and create/update an event for each
        for (const [index, artist] of artists.entries()) {
            console.log(`Processing artist: ${artist.name}...`);

            const eventData = {
                created_by: userId,
                artist_id: artist.id,
                contractor_id: contractor!.id,
                event_name: `Show ${artist.name} - Turnê 2025`,
                venue_name: `Arena ${artist.name}`,
                city: 'São Paulo', // Static for simplicity, or randomize
                state: 'SP',
                country: 'Brasil',
                date: getRandomDate(index),
                status: 'confirmed',
                type: 'show',
                contract_url: 'https://example.com/contrato_modelo.pdf',
                details_contacts: {
                    produtor_geral: `Produtor Geral (${artist.name})`,
                    produtor_palco: 'João Palco',
                    produtor_tecnico: 'Maria Técnica',
                    assessoria_imprensa: 'Imprensa Global',
                    produtor_financeiro: 'Financeiro Corp',
                    diarias_alimentacao: 'R$ 250,00',
                    cortesias: '100 Vips',
                    carregadores: '10 Carregadores'
                },
                details_suppliers: {
                    sonorizacao: 'Audio System Pro',
                    iluminacao: 'Lux Light',
                    led: 'Ledwall 10x5m',
                    palco: 'Super Stage 20x15',
                    gride: 'Q50 Heavy',
                    estrutura_camarim: 'Estrutura Premium',
                    abastecimento_camarim: 'Catering Completo',
                    geradores: '4x 250kVA'
                },
                details_transports: {
                    responsavel_transporte: 'Logística Nacional',
                    motorista_bau: 'Motorista 01',
                    motorista_van_tecnica: 'Motorista 02',
                    motorista_van_banda: 'Motorista 03',
                    motorista_suv_artista: 'Motorista Blindado'
                },
                details_lodging: {
                    contato_hotel: 'Recepção (11) 3333-4444',
                    nome_hotel: 'Hotel Grand Hyatt',
                    cidade_hospedagem: 'São Paulo'
                },
                details_lineup: {
                    atracao1: '20:00 - Dj Warmup',
                    atracao2: `22:00 - ${artist.name}`,
                    atracao3: '00:00 - After Party',
                    atracao4: '',
                    atracao5: ''
                }
            };

            // Upsert Logic: Check if we already created a generic seed event for this artist
            // We use the event_name pattern to identify our seed events
            const { data: existingEvent } = await supabase.from('events')
                .select('id')
                .eq('artist_id', artist.id)
                .ilike('event_name', `Show ${artist.name}%`)
                .limit(1)
                .single();

            if (existingEvent) {
                console.log(`   🔄 Updating existing event: ${existingEvent.id}`);
                await supabase.from('events').update(eventData).eq('id', existingEvent.id);
            } else {
                console.log(`   ➕ Creating new event for ${artist.name}`);
                await supabase.from('events').insert(eventData);
            }
        }

        console.log('✅ Mass Seed Completed Successfully!');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

seed();
