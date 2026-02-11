# Guia de Deploy - Dw Sistemas

Sistema de gerenciamento de eventos e shows desenvolvido com React + Vite (frontend) e Express + TypeScript (backend), usando Supabase como banco de dados.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Node.js 18+ instalado localmente

## 🔧 Configuração do Supabase

1. **Criar Projeto no Supabase**
   - Acesse https://supabase.com/dashboard
   - Crie um novo projeto
   - Anote a URL e as chaves (anon/public key e service_role key)

2. **Executar Script SQL**
   - No painel do Supabase, vá em SQL Editor
   - Execute o conteúdo do arquivo `server/database.sql`
   - Isso criará todas as tabelas necessárias

3. **Configurar Storage (Opcional)**
   - Vá em Storage no painel
   - Crie um bucket público chamado `images`
   - Isso permite upload de logos de artistas e avatares

## 🚀 Deploy do Backend (Vercel)

### 1. Preparar o Projeto

Certifique-se de que o arquivo `server/.env.example` está preenchido corretamente.

### 2. Deploy via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy do backend
cd server
vercel
```

### 3. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em Settings → Environment Variables e adicione:

```
PORT=5000
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_publica
SUPABASE_SERVICE_KEY=sua_chave_de_servico
JWT_SECRET=uma_string_aleatoria_muito_segura
FRONTEND_URL=https://seu-dominio-frontend.vercel.app
```

**IMPORTANTE**: Use um JWT_SECRET forte em produção (mínimo 32 caracteres aleatórios).

### 4. Configurar Build Settings

No Vercel, configure:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🎨 Deploy do Frontend (Vercel)

### 1. Criar arquivo `.env` local

```bash
cd client
cp .env.example .env
```

Edite `.env` e adicione a URL do backend:
```
VITE_API_URL=https://seu-backend.vercel.app/api
```

### 2. Deploy via Vercel

```bash
cd client
vercel
```

### 3. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel (projeto do frontend), adicione:

```
VITE_API_URL=https://seu-backend.vercel.app/api
```

### 4. Configurar Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## ✅ Verificação Pós-Deploy

1. **Testar Backend**
   ```bash
   curl https://seu-backend.vercel.app/api/health
   ```

2. **Testar Frontend**
   - Acesse `https://seu-frontend.vercel.app`
   - Tente fazer login com credenciais de teste

3. **Criar Primeiro Usuário Admin**
   - Use o SQL Editor do Supabase para inserir um usuário admin:
   ```sql
   INSERT INTO users (email, password, name, role)
   VALUES ('admin@example.com', 'hash_da_senha', 'Admin', 'admin');
   ```
   - Use bcrypt para gerar o hash da senha

## 🔒 Segurança

- ✅ `.env` está no `.gitignore`
- ✅ JWT_SECRET forte em produção
- ✅ CORS configurado corretamente
- ✅ Helmet.js ativado no backend
- ✅ Row Level Security (RLS) ativo no Supabase

## 📝 Notas Importantes

- O backend e frontend devem estar em projetos separados no Vercel
- Sempre use HTTPS em produção
- Mantenha as chaves do Supabase seguras
- Faça backup regular do banco de dados

## 🐛 Troubleshooting

**Erro de CORS**: Verifique se `FRONTEND_URL` está configurado corretamente no backend

**Erro 401**: Verifique se o JWT_SECRET é o mesmo em todos os ambientes

**Erro de conexão com Supabase**: Verifique as credenciais e se o projeto está ativo

## 📚 Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vite](https://vitejs.dev)
