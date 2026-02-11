import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

console.log('Conectando a:', supabaseUrl);

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

async function testConnection() {
    console.log('--- Testando Tabelas ---');

    const tables = ['users', 'artists', 'contractors', 'events'];

    for (const table of tables) {
        const { data, count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`Erro na tabela ${table}:`, error.message);
        } else {
            console.log(`Tabela ${table}: ${count} registros encontrados.`);
        }
    }
}

testConnection();
