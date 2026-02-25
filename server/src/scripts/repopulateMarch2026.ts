
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server directory
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const repopulateMarch2026 = async () => {
    console.log('🌱 Starting repopulation process for March 2026...');

    try {
        // 1. Clear existing events
        console.log('🗑️ Clearing ALL existing events...');
        const { error: clearError } = await supabase.from('events').delete().gt('created_at', '1970-01-01');

        if (clearError) {
            console.error('Error clearing events:', clearError);
            return;
        }

        // IDs verified via curl
        const tarcisioId = 'f00d34b0-7888-441b-9823-c4bb567eccae';
        const vitorId = '7ffeb34e-3f53-466a-85f4-ebd215334b6a';
        const contractorId = 'd4bf508f-8c41-4772-ba04-cab6774422d7'; // Prefeitura Municipal de Teste

        const events = [];
        const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Recife', 'Manaus', 'Curitiba', 'Porto Alegre', 'Brasília'];
        const states = ['SP', 'RJ', 'MG', 'BA', 'CE', 'PE', 'AM', 'PR', 'RS', 'DF'];

        for (let day = 1; day <= 31; day++) {
            const dateStr = `2026-03-${day.toString().padStart(2, '0')}T21:00:00`;
            const artistId = day % 2 === 0 ? vitorId : tarcisioId;
            const artistName = day % 2 === 0 ? 'Vitor Fernandes' : 'Tarcisio do Acordeon';
            const cityIndex = day % cities.length;

            events.push({
                artist_id: artistId,
                contractor_id: contractorId,
                event_name: `${artistName} em Concert - Dia ${day}`,
                date: dateStr,
                city: cities[cityIndex],
                state: states[cityIndex],
                venue_name: `Arena Central ${day}`,
                status: day < 15 ? 'confirmed' : 'pending',
                type: 'show',
                details_contacts: {
                    produtor_geral: { name: 'João Silva', phone: '(11) 98765-4321' }
                },
                updated_at: new Date().toISOString()
            });
        }

        console.log(`📝 Inserting ${events.length} events for March 2026...`);

        const { error: insertError } = await supabase.from('events').insert(events);

        if (insertError) {
            console.error('Error inserting events:', insertError);
        } else {
            console.log('✅ Repopulation completed successfully!');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

repopulateMarch2026();
