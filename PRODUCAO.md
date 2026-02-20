# Manual de Produção: Stellar Nebula

## 1. Status Atual do E-mail (Diagnóstico)
- **O Problema**: O envio de e-mails usando Gmail pessoal (portas 465/587) falha no Render devido a bloqueios de rede/firewall (Timeouts), tanto em IPv4 quanto IPv6. Isso é uma medida de segurança padrão em hospedagens de nuvem para evitar spam.
- **O Código Atual**: O arquivo `server/src/utils/email.ts` foi limpo de "gambiarras" e está usando a configuração padrão e robusta do `nodemailer`. Ele está pronto para conectar com qualquer serviço profissional (como Resend, SendGrid, Mailgin) assim que as credenciais forem fornecidas.

## 2. Solução Definitiva: Resend + Domínio Próprio
Para o sistema funcionar profissionalmente e sem interrupções, a estratégia recomendada é:

### A. Comprar um Domínio
- **Onde**: Recomendo **Namecheap** ou **Porkbun**.
- **Custo**: Aprox. $10 USD/ano.
- **Evite**: GoDaddy (custos de renovação altos).

### B. Configurar o Resend
1.  Crie conta no [Resend.com](https://resend.com).
2.  Adicione seu domínio no painel do Resend ("Domains" > "Add Domain").
3.  O Resend fornecerá registros DNS (Tipo `TXT`, `MX`, `CNAME`).
4.  Vá no painel de onde comprou o domínio e adicione esses registros.
5.  Após verificar (status "Verified"), você poderá enviar e-mails ilimitados (dentro do plano gratuito de 3000/mês) sem bloqueios.

### C. Configuração no Render (Environment Variables)
Quando tiver o domínio verificado, atualize as variáveis no Render:

- `SMTP_HOST`: `smtp.resend.com`
- `SMTP_PORT`: `465` (Porta Segura SSL)
- `SMTP_SECURE`: `true`
- `SMTP_USER`: `resend`
- `SMTP_PASS`: `(Sua API Key do Resend)`
- `SMTP_FROM`: `suporte@seudominio.com` (ou `nao-responda@seudominio.com`)

---
**Observação Importante (Plano Gratuito sem Domínio)**:
Enquanto não tiver o domínio pago, o envio de e-mail pelo Resend fica restrito:
*   Você **só consegue enviar** para o e-mail que usou no cadastro do Resend.
*   O remetente **deve ser** `onboarding@resend.dev`.
*   Qualquer tentativa de enviar para outros usuários falhará.

## 3. Stack Recomendada para Produção
Para ter o melhor custo-benefício, escalabilidade e performance:

| Componente | Serviço Recomendado | Plano Sugerido | Por quê? |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Gratuito (Hobby) | Melhor CDN global, deploy automático com Git, excelente para React/Vite. |
| **Backend** | **Render** | Gratuito (Dev) / $7 (Prod) | Simples de usar. O plano pago ($7/mês) evita que o servidor "durma" (cold start) e remove limites de uso. Se precisar de mais controle, use **Railway**. |
| **Banco de Dados** | **Supabase** | Gratuito | PostgreSQL gerenciado, rápido, seguro e já tem autenticação integrada se precisar. |
| **E-mail** | **Resend** | Gratuito | Feito por desenvolvedores para desenvolvedores. Melhor API e entregabilidade garantida. |
| **Domínio** | **Namecheap** | ~$10/ano | Preço justo, suporte bom e propagação de DNS rápida. |
