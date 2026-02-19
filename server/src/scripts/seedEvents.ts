
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedEvents = async () => {
    console.log('🌱 Starting seed process...');

    try {
        // 1. Clear existing events
        console.log('🗑️ Clearing existing events...');
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using safe inequality if needed or just empty filter for all)

        // Note: .delete().neq('id', '...') is a hack to delete all rows if RLS allows or if using service role key. 
        // If not, we might need to fetch IDs first. 
        // Better: .delete().not('id', 'is', null)

        // Actually, Supabase client needs a filter for delete.
        // Let's use a filter that matches everything.
        const { error: clearError } = await supabase.from('events').delete().gt('created_at', '1970-01-01');

        if (clearError) {
            console.error('Error clearing events:', clearError);
            return;
        }

        // 2. Create Dummy Data
        const dummyEvents = [
            {
                event_name: 'Festival de Verão 2026',
                date: '2026-03-15T20:00:00',
                city: 'São Paulo',
                state: 'SP',
                venue_name: 'Sambódromo do Anhembi',
                status: 'confirmed',
                type: 'show',
                details_contacts: {
                    produtor_geral: { name: 'João Silva', phone: '(11) 98765-4321' },
                    produtor_palco: { name: 'Maria Souza', phone: '(11) 91234-5678' },
                    assessoria_imprensa: { name: 'Imprensa SP', phone: '(11) 3333-4444' }
                },
                details_suppliers: {
                    sonorizacao: { name: 'AudioTech', phone: '(11) 5555-6666' },
                    iluminacao: { name: 'Luz & Cor', phone: '(11) 7777-8888' }
                },
                details_transports: {
                    responsavel_transporte: { name: 'Carlos Transportes', phone: '(11) 9999-0000' }
                },
                details_lodging: {
                    contato_hotel: { name: 'Recepção Hotel', phone: '(11) 2222-3333' },
                    nome_hotel: { name: 'Hotel Grand Plaza', phone: '(11) 2222-3333' },
                    cidade_hospedagem: 'São Paulo' // String, without phone
                },
                details_lineup: {
                    atracao1: '20:00 - Abertura',
                    atracao2: '21:00 - Banda Principal',
                    atracao3: '23:00 - Encerramento'
                }
            },
            {
                event_name: 'Show Corporativo Tech',
                date: '2026-04-20T19:00:00',
                city: 'Rio de Janeiro',
                state: 'RJ',
                venue_name: 'Centro de Convenções SulAmérica',
                status: 'pending',
                type: 'event',
                details_contacts: {
                    produtor_geral: { name: 'Ana Pereira', phone: '(21) 98888-7777' }
                },
                details_lodging: {
                    cidade_hospedagem: 'Rio de Janeiro' // String
                }
            },
            {
                event_name: 'Aniversário da Cidade',
                date: '2026-05-10T18:00:00',
                city: 'Belo Horizonte',
                state: 'MG',
                venue_name: 'Praça da Estação',
                status: 'confirmed',
                type: 'show',
                details_contacts: {
                    produtor_geral: { name: 'Roberto Lima', phone: '(31) 97777-6666' }
                },
                details_lodging: {
                    nome_hotel: { name: 'Hotel BH', phone: '(31) 3222-1111' },
                    cidade_hospedagem: 'Belo Horizonte'
                }
            }
        ];

        console.log(`📝 Inserting ${dummyEvents.length} events...`);

        // Insert events loop to handle potential errors individually if needed, or batch
        const { error: insertError } = await supabase.from('events').insert(dummyEvents);

        if (insertError) {
            console.error('Error inserting events:', insertError);
        } else {
            console.log('✅ Seed completed successfully!');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

seedEvents();
