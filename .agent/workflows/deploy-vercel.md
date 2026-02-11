---
description: Como fazer o deploy da aplicação no Vercel
---

# Guia de Deploy no Vercel

Este projeto consiste em um Frontend (React/Vite) e um Backend (Node/Express). O Vercel é ideal para o Frontend. Para o Backend, embora o Vercel suporte Serverless Functions, recomendamos o **Render.com** para uma API Express tradicional.

## 1. Preparando o Frontend (Vercel)

### Passo a Passo:
1.  **Crie sua conta** no [Vercel](https://vercel.com).
2.  **Conecte seu repositório** (GitHub, GitLab ou Bitbucket).
3.  **Configurações do Projeto**:
    *   **Root Directory**: Selecione a pasta `client`.
    *   **Framework Preset**: Selecione `Vite`.
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
4.  **Variáveis de Ambiente**:
    Em "Environment Variables", adicione:
    *   `VITE_API_URL`: A URL onde seu backend estará rodando (ex: `https://seu-backend.onrender.com`).

## 2. Preparando o Backend (Recomendação: Render.com)

O Vercel não é otimizado para servidores Express de longa duração. Recomendamos o **Render**:
1.  Crie uma conta no [Render.com](https://render.com).
2.  Crie um novo **Web Service**.
3.  **Root Directory**: Selecione a pasta `server`.
4.  **Build Command**: `npm install && npm run build`.
5.  **Start Command**: `npm start`.
6.  **Variáveis de Ambiente**:
    Adicione as variáveis do seu `.env`:
    *   `SUPABASE_URL`
    *   `SUPABASE_SERVICE_KEY`
    *   `JWT_SECRET`
    *   `FRONTEND_URL`: A URL do seu site no Vercel (ex: `https://seu-projeto.vercel.app`).

## 3. Deploy do Backend no Vercel (Opcional - Avançado)

Se você desejar manter tudo no Vercel, precisará de um arquivo `vercel.json` na pasta `server`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

> [!WARNING]
> Isso converterá seu servidor Express em uma **Serverless Function**. Algumas partes do código podem precisar de ajustes mínimos.

## 4. Checklist Pós-Deploy
- [ ] Verifique se o `CORS` no backend permite a URL do Vercel.
- [ ] Certifique-se de que as chaves do Supabase estão corretas em ambos os ambientes.
- [ ] Teste o login com o novo usuário `diegowoolley@gmail.com`.
