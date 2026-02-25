import { supabase } from '../db.js';

async function verifySchema() {
    try {
        console.log('--- VERIFICANDO SCHEMA FINANCEIRO ---');

        // Verificar tabela financial_transactions
        const { error: transError } = await supabase
            .from('financial_transactions')
            .select('*')
            .limit(1);

        if (transError) {
            console.log('❌ Tabela financial_transactions:', transError.message);
        } else {
            console.log('✅ Tabela financial_transactions: OK');
        }

        // Verificar tabela artist_subscriptions
        const { error: subError } = await supabase
            .from('artist_subscriptions')
            .select('*')
            .limit(1);

        if (subError) {
            console.log('❌ Tabela artist_subscriptions:', subError.message);
        } else {
            console.log('✅ Tabela artist_subscriptions: OK');
        }

        // Verificar colunas na tabela artists
        const { data: artistData, error: artError } = await supabase
            .from('artists')
            .select('*')
            .limit(1);

        if (artError) {
            console.log('❌ Tabela artists:', artError.message);
        } else if (artistData && artistData.length > 0) {
            const columns = Object.keys(artistData[0]);
            console.log('Colunas em artists:', columns.join(', '));
            if (columns.includes('subscription_status')) {
                console.log('✅ Coluna subscription_status: OK');
            } else {
                console.log('❌ Coluna subscription_status: FALTANDO');
            }
            if (columns.includes('subscription_expires_at')) {
                console.log('✅ Coluna subscription_expires_at: OK');
            } else {
                console.log('❌ Coluna subscription_expires_at: FALTANDO');
            }
        } else {
            console.log('⚠️ Tabela artists está vazia, não foi possível verificar colunas via select.');
        }

        console.log('------------------------------------');
    } catch (error: any) {
        console.error('Erro geral durante verificação:', error.message);
    }
}

verifySchema();
