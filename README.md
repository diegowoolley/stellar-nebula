# Sistema de Gestão de Eventos Artísticos

Uma plataforma web completa para gerenciar eventos artísticos, artistas e contratantes.

## Tecnologias

*   **Frontend**: React, TypeScript, TailwindCSS, Vite
*   **Backend**: Node.js, Express, Supabase (PostgreSQL)
*   **Auth**: JWT + Supabase Auth

## Como Começar

### Pré-requisitos

*   Node.js instalado
*   Projeto Supabase (URL e Chave)

### Instalação

1.  **Clone/Baixe o repositório**

2.  **Configuração do Backend**
    ```bash
    cd server
    npm install
    cp .env.example .env # (Crie .env com suas credenciais)
    npm run dev
    ```

3.  **Configuração do Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Banco de Dados**
    Execute o script SQL em `server/database.sql` no seu Editor SQL do Supabase.

## Variáveis de Ambiente

**Servidor (.env)**
```
PORT=5000
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

## Funcionalidades

*   **Dashboard**: Visão geral dos próximos eventos.
*   **Artistas**: Operações de CRUD para artistas.
*   **Eventos**: Gerencie agendamentos de eventos.
*   **Autenticação**: Login/Logout seguro.
