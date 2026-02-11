# Troubleshooting: Erro de Login em Produção

## 🔍 Problema
Após deploy no Vercel (frontend) e Render (backend), o login retorna "Credenciais inválidas".

## ✅ Checklist de Verificação

### 1. Verificar Variáveis de Ambiente no Render

Acesse o painel do Render → seu serviço → Environment

**Verifique se todas as variáveis estão configuradas:**

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica_anon
SUPABASE_SERVICE_KEY=sua_chave_service_role
JWT_SECRET=string_aleatoria_segura_minimo_32_caracteres
FRONTEND_URL=https://seu-frontend.vercel.app
```

**⚠️ IMPORTANTE:**
- `FRONTEND_URL` deve ser **SEM** `/login` no final
- Exemplo correto: `https://gestordeeventos.vercel.app`
- Exemplo errado: `https://gestordeeventos.vercel.app/login`

### 2. Verificar Variáveis de Ambiente no Vercel

Acesse Vercel → seu projeto → Settings → Environment Variables

**Deve ter:**
```
VITE_API_URL=https://seu-backend.onrender.com/api
```

**⚠️ IMPORTANTE:**
- A URL deve terminar com `/api`
- Exemplo: `https://stellar-nebula-api.onrender.com/api`

### 3. Verificar se Há Usuários no Banco de Dados

O erro mais comum é **não ter nenhum usuário cadastrado** no Supabase!

#### Como Criar Usuário Admin

1. **Acesse o Supabase Dashboard**
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em SQL Editor**

3. **Execute este script para criar um usuário admin:**

```sql
-- Criar usuário admin
INSERT INTO users (email, password, name, role, avatar_url)
VALUES (
  'admin@example.com',
  '$2b$10$rKvVJH9YvGZxF7P3qN5qXOYJ5QZxF7P3qN5qXOYJ5QZxF7P3qN5qXO',
  'Administrador',
  'admin',
  NULL
);
```

**Credenciais de login:**
- Email: `admin@example.com`
- Senha: `admin123`

#### Como Criar Sua Própria Senha

Se quiser usar outra senha, você precisa gerar o hash bcrypt:

**Opção 1: Usar Node.js local**

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SUA_SENHA_AQUI', 10).then(console.log);"
```

**Opção 2: Usar site online**
- Acesse: https://bcrypt-generator.com/
- Digite sua senha
- Use rounds: 10
- Copie o hash gerado

Depois execute no SQL Editor:

```sql
INSERT INTO users (email, password, name, role)
VALUES (
  'seu-email@example.com',
  'HASH_BCRYPT_GERADO_AQUI',
  'Seu Nome',
  'admin'
);
```

### 4. Verificar CORS

Se o erro persistir, pode ser problema de CORS.

**No código do backend** (`server/src/index.ts`), verifique se o CORS está configurado:

```typescript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

**Certifique-se que `FRONTEND_URL` no Render está correta!**

### 5. Testar Backend Diretamente

Teste se o backend está respondendo:

```bash
curl https://seu-backend.onrender.com/api/health
```

Se retornar erro, o backend não está rodando corretamente.

### 6. Verificar Logs do Render

1. Acesse Render Dashboard → seu serviço
2. Vá em "Logs"
3. Procure por erros como:
   - `SUPABASE_URL is not defined`
   - `JWT_SECRET is not defined`
   - Erros de conexão com Supabase

### 7. Redeploy Após Mudanças

Sempre que alterar variáveis de ambiente:

1. **No Render**: O serviço reinicia automaticamente
2. **No Vercel**: Faça um novo deploy
   ```bash
   vercel --prod
   ```

## 🧪 Teste Passo a Passo

1. **Abra o Console do Navegador** (F12)
2. **Tente fazer login**
3. **Vá na aba Network**
4. **Procure pela requisição para `/api/auth/login`**
5. **Verifique:**
   - Status Code (deve ser 200 se sucesso, 401 se credenciais erradas)
   - Response (mensagem de erro)
   - Request URL (deve apontar para seu backend no Render)

## 📋 Resumo das Causas Mais Comuns

| Problema | Solução |
|----------|---------|
| Nenhum usuário no banco | Criar usuário admin via SQL |
| FRONTEND_URL incorreta | Remover `/login` do final |
| VITE_API_URL incorreta | Adicionar `/api` no final |
| CORS bloqueando | Verificar FRONTEND_URL no backend |
| JWT_SECRET diferente | Usar o mesmo em dev e prod |
| Backend não está rodando | Verificar logs do Render |

## 🆘 Ainda com Problemas?

Se nada funcionar, compartilhe:
1. URL do frontend
2. URL do backend
3. Screenshot do erro no console do navegador (F12 → Console)
4. Screenshot da aba Network mostrando a requisição de login
