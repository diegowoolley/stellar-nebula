-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- Tabela de Usuários
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null, -- Armazenar senha com hash se gerenciar auth manualmente
  name text,
  role text default 'viewer' check (role in ('admin', 'producer', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Artistas
create table artists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Contratantes
create table contractors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Eventos
create table events (
  id uuid default uuid_generate_v4() primary key,
  artist_id uuid references artists(id) on delete set null,
  contractor_id uuid references contractors(id) on delete set null,
  city text not null,
  state text,
  country text default 'Brasil',
  date timestamp with time zone not null,
  status text default 'pending' check (status in ('confirmed', 'pending', 'cancelled')),
  type text default 'show' check (type in ('show', 'event', 'meeting')),
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Segurança em Nível de Linha) - habilite se usar Supabase Auth
alter table users enable row level security;
alter table artists enable row level security;
alter table contractors enable row level security;
alter table events enable row level security;

-- Políticas (Simplificadas por enquanto - leitura pública, escrita autenticada)
create policy "Acesso de leitura público" on artists for select using (true);
create policy "Acesso de leitura público" on events for select using (true);
