# Guia de Solução de Problemas

Problemas comuns ao instalar, rodar ou usar o FoodApp — e como resolver.

---

## Instalação e ambiente

### `npm install` falha ou trava

- Confirme que está usando **Node.js 20+** (`node -v`).
- Apague `node_modules` e o lockfile conflitante (o projeto tem `package-lock.json` **e** `pnpm-lock.yaml` — use apenas um gerenciador de pacotes, não misture `npm install` com `pnpm install` no mesmo checkout).

### Erro `Can't reach database server` ao rodar `npm run prisma:migrate`

- O PostgreSQL não está rodando, ou a `DATABASE_URL` no `.env` está incorreta.
- Verifique se o Postgres está ativo: `pg_isready` (ou o comando equivalente da sua instalação/Docker).
- Confira usuário, senha, host e porta na `DATABASE_URL` — o erro mais comum é senha errada ou porta divergente (padrão `5432`).

### `npx prisma generate` não reflete mudanças no schema

- Depois de editar `prisma/schema.prisma`, sempre rode `npx prisma generate` de novo antes de `npm run dev`, ou o Prisma Client em uso ainda será o antigo (problema comum após `git pull` que trouxe mudança de schema).

---

## Autenticação

### Login com Google não funciona / redireciona com erro

- Confira se `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` estão corretos no `.env`.
- No [Google Cloud Console](https://console.cloud.google.com), confirme que a URL de callback autorizada inclui `http://localhost:3000/api/auth/callback/google` (em desenvolvimento) ou o domínio de produção correspondente.
- `NEXTAUTH_URL` no `.env` precisa bater exatamente com a URL que você está acessando (incluindo protocolo `http`/`https`).

### Erro genérico de sessão / `AUTH_SECRET` ausente

- `AUTH_SECRET` é obrigatório mesmo em desenvolvimento. Gere um com `openssl rand -base64 32` e coloque no `.env`.

### Login por e-mail/senha diz "credenciais inválidas" mesmo com a senha certa

- Confirme que a conta foi criada via e-mail/senha e não via Google — contas Google não têm `password` no banco, então login por credentials sempre falha para elas (por design).
- Rode `npm run prisma:seed` se estiver testando em um banco recém-criado sem dados — o seed cria contas de teste válidas (ver credenciais no `README.md`).

### `/admin` redireciona para `admin/login?error=unauthorized` mesmo logado

- Sua conta não tem `role = ADMIN` no banco. Verifique com `npm run prisma:studio` ou promova o usuário manualmente no banco (não há tela de promoção dentro do app — ver `manual-do-admin.md`).
- Confira também se seu e-mail está listado em `ADMIN_EMAILS` no `.env`, se essa variável for usada no seu fluxo de login específico.

---

## E-mail (recuperação de senha)

### O link de redefinição de senha não chega por e-mail

- Sem `RESEND_API_KEY` configurada, o comportamento é **esperado**: o link aparece no terminal onde o `npm run dev` está rodando, não no e-mail. Isso é o modo de desenvolvimento documentado no README.
- Com a chave configurada, confira se `EMAIL_FROM` usa um domínio verificado no Resend — domínios não verificados fazem o envio falhar silenciosamente ou cair em spam.

### Token de redefinição inválido ou expirado

- Tokens têm expiração e uso único (`PasswordResetToken.expiresAt` / `used`). Solicite um novo link — o anterior não pode ser reutilizado mesmo que ainda não tenha expirado, se já foi usado uma vez.

---

## Testes

### Testes de integração falham com erro de conexão ao banco

- Os testes de integração usam Prisma mockado (não um banco real) — se está vendo erro de conexão real ao Postgres durante os testes, verifique se algum teste está importando `lib/prisma.ts` sem passar pelo mock configurado em `jest.setup.ts`.

### Cobertura cai abaixo de 80% após uma mudança

- Rode `npm test -- --coverage` localmente antes de abrir PR — o pipeline de CI vai falhar no Job 1 se a cobertura cair, bloqueando o merge (ver `docs/arquitetura.md` e o fluxo de CI/CD no `README.md`).

---

## Cardápio e imagens

### Pratos aparecem sem imagem, sem ingredientes, ou a página de detalhe não carrega

- O catálogo depende da API pública **TheMealDB**. Se ela estiver instável ou fora do ar, pratos podem carregar parcialmente ou falhar. Isso é uma dependência externa, não um bug do FoodApp — confira a [status da TheMealDB] ou tente novamente mais tarde.
- Um `mealId` que existe num pedido/favorito antigo, mas não é mais retornado pela API, aparece como item "órfão" na lista de pedidos (nome ausente) — comportamento esperado, documentado em `modelo-de-dados.md`.

---

## Assistente de recomendação (chat)

### O widget de chat não responde ou dá erro

- Confirme que `GROQ_API_KEY` está definida no `.env` (o nome interno da variável no código é `XAI_API_KEY`, por compatibilidade — não se confunda, o valor ainda é a chave do Groq).
- Usuários não logados só veem uma mensagem convidando ao login — isso não é erro, é o comportamento esperado (recomendações personalizadas exigem contexto do usuário).

---

## Build e deploy

### `npm run build` falha após alterações no schema do Prisma

- Rode `npx prisma generate` antes do build — o Next.js não gera o client automaticamente durante `npm run build` a menos que isso esteja configurado no `postinstall`; se o pipeline de CI falhar aqui, confira o passo "Gera Prisma Client" no `ci.yml`.

### Deploy automático no Vercel não dispara

- **Integração Git:** confira em Vercel → Project → Settings → Git se o repositório está conectado e se a branch de produção é `main`.
- **Job 3 do GitHub Actions:** só roda na `main`, depois dos Jobs 1 e 2, e só executa os passos de deploy se `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estiverem em **Settings → Secrets and variables → Actions**. Sem eles, o job mostra um aviso e não faz deploy (ver [`deploy.md`](./deploy.md)).

### Site publicado abre, mas login, carrinho ou pedidos falham ("Erro interno do servidor")

- **Causa mais comum:** o projeto do Supabase foi pausado por inatividade (plano gratuito pausa após 7 dias). Entre no painel do Supabase e clique em **Restore project**. O workflow `keep-alive.yml` existe para evitar isso.

- O cardápio vem da TheMealDB, então a home funciona mesmo sem banco. Login, pedidos e favoritos precisam de `DATABASE_URL` e `DIRECT_URL` configuradas na Vercel e das migrations aplicadas (`npx prisma migrate deploy`). Veja [`deploy.md`](./deploy.md#4-banco-de-dados-em-produção).
- Confira também `AUTH_SECRET`, `JWT_SECRET` e `NEXTAUTH_URL` (deve ser a URL de produção).

---

Se o problema não estiver listado aqui, verifique os logs do terminal (`npm run dev`) e do pipeline de CI (aba **Actions** do repositório) — a maioria dos erros de ambiente aparece detalhada ali.
