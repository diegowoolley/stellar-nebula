-- Migração para o Módulo Financeiro

-- Tabela de Transações Financeiras (Entradas e Saídas)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Tabela de Assinaturas de Artistas
CREATE TABLE IF NOT EXISTS artist_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('mensal', 'trimestral', 'semestral', 'anual')),
    amount NUMERIC(15, 2) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'cancelado', 'expirado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Atualizar Tabela de Artistas com controle de status financeiro
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inativo' CHECK (subscription_status IN ('ativo', 'inativo')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Função para atualizar o status do artista baseado na expiração da assinatura
CREATE OR REPLACE FUNCTION check_artist_subscription_status() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_expires_at < NOW() THEN
        NEW.subscription_status := 'inativo';
    ELSE
        NEW.subscription_status := 'ativo';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para automatizar a atualização de status (Opcional, pode ser feito via Worker ou consulta)
-- DROP TRIGGER IF EXISTS trigger_update_artist_status ON artists;
-- CREATE TRIGGER trigger_update_artist_status
-- BEFORE UPDATE ON artists
-- FOR EACH ROW
-- EXECUTE FUNCTION check_artist_subscription_status();
