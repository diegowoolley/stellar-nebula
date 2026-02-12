-- Migration: Add technical details columns to events table

DO $$
BEGIN
    -- Add event_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_name') THEN
        ALTER TABLE events ADD COLUMN event_name text;
    END IF;

    -- Add venue_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_name') THEN
        ALTER TABLE events ADD COLUMN venue_name text;
    END IF;

    -- Add contract_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'contract_url') THEN
        ALTER TABLE events ADD COLUMN contract_url text;
    END IF;

    -- Add details_contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'details_contacts') THEN
        ALTER TABLE events ADD COLUMN details_contacts jsonb default '{}'::jsonb;
    END IF;

    -- Add details_suppliers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'details_suppliers') THEN
        ALTER TABLE events ADD COLUMN details_suppliers jsonb default '{}'::jsonb;
    END IF;

    -- Add details_transports
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'details_transports') THEN
        ALTER TABLE events ADD COLUMN details_transports jsonb default '{}'::jsonb;
    END IF;

    -- Add details_lodging
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'details_lodging') THEN
        ALTER TABLE events ADD COLUMN details_lodging jsonb default '{}'::jsonb;
    END IF;

    -- Add details_lineup
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'details_lineup') THEN
        ALTER TABLE events ADD COLUMN details_lineup jsonb default '{}'::jsonb;
    END IF;

END $$;
