import { supabase } from '../db.js';

async function listUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('email, role, name');

        if (error) throw error;

        console.log('--- USUÁRIOS NO BANCO ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('------------------------');
    } catch (error: any) {
        console.error('Erro ao listar usuários:', error.message);
    }
}

listUsers();
