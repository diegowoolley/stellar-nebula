import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ ERRO: Necessário configurar SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env');
    console.error('A chave SUPABASE_SERVICE_KEY (service_role) pode ser encontrada no painel do Supabase em Settings > API.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'diegowoolley@gmail.com';
    const password = 'Nsx-sz21';

    console.log(`Tentando criar/atualizar usuário admin: ${email}`);

    try {
        // 1. Verificar se usuário já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('⚠️ Usuário admin já existe.');
            return;
        }

        // 2. Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Inserir usuário (bypassing RLS graças à serviceKey)
        const { data, error } = await supabase
            .from('users')
            .insert({
                email,
                password: hashedPassword,
                name: 'Administrador Root',
                role: 'admin'
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('✅ Usuário admin criado com sucesso!');
        console.log('ID:', data.id);
        console.log('Email:', data.email);
        console.log('Role:', data.role);

    } catch (error: any) {
        console.error('❌ Erro ao criar usuário:', error.message || error);
        if (error.details) console.error('Detalhes:', error.details);
        if (error.hint) console.error('Dica:', error.hint);
    }
}

createAdmin();
