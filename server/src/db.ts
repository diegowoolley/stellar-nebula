/**
 * Configuração de Conexão com o Banco de Dados (Supabase).
 * 
 * Este módulo inicializa o cliente Supabase para ser utilizado em todo o servidor.
 * Ele tenta utilizar chaves de serviço de alto privilégio primeiro (SUPABASE_SERVICE_KEY),
 * caso contrário, utiliza a chave pública padrão (SUPABASE_KEY).
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// Tenta usar a Service Key primeiro (para operações backend com privilégios que ignoram RLS),
// caso contrário usa a chave pública (que respeita RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('URL ou Chave do Supabase ausente no arquivo .env');
    // Não lançamos erro aqui para permitir que o servidor inicie mesmo sem as chaves,
    // mas as operações de banco de dados falharão subseqüentemente.
}

// Opções exclusivas para o cliente backend (não precisamos de persistência de sessão aqui)
const options = {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
};

/**
 * Cliente Supabase exportado para ser usado pelos Controllers e Middlewares.
 */
export const supabase = createClient(supabaseUrl || '', supabaseKey || '', options);
