# 🍔 FoodApp

Aplicação full-stack de pedidos de refeições desenvolvida como parte das **Atividades 2, 3 e 4 — PPE III**.

🌐 **Aplicação publicada:** https://meal-delivery-eight.vercel.app · 📡 **API (Swagger):** https://meal-delivery-eight.vercel.app/api-docs

**O problema que resolve:** centraliza o processo de pedido de refeições — cardápio, carrinho, checkout, acompanhamento de status e gestão administrativa de pedidos — em um único fluxo web, com autenticação segura e uma API REST própria que pode ser consumida por outros clientes (mobile, integrações, etc).

Combina uma interface web moderna com uma API RESTful completa, autenticação dupla (Google OAuth + e-mail/senha com JWT), banco de dados PostgreSQL via Prisma ORM, recuperação de senha por e-mail, controle de acesso por papel (USER / ADMIN), suíte de testes automatizados e pipeline de CI/CD com GitHub Actions.

---

## 🏗️ Arquitetura

O projeto segue o padrão em camadas integrado ao **Next.js App Router**:

```
src/
├── app/
│   ├── (auth)/login/           ← Página de login/registro do usuário
│   ├── admin/                  ← Painel administrativo (protegido)
│   ├── cart/                   ← Carrinho e checkout (protegido)
│   ├── profile/                ← Perfil e histórico (protegido)
│   ├── forgot-password/        ← Solicitar recuperação de senha
│   ├── reset-password/         ← Redefinir senha via token
│   ├── meal/[id]/              ← Detalhe do prato
│   └── api/                    ← Endpoints REST
│       ├── auth/
│       │   ├── [...nextauth]/  — Handler NextAuth (OAuth + sessão)
│       │   ├── login/          — POST /api/auth/login (JWT próprio)
│       │   └── register/       — POST /api/auth/register
│       ├── meals/              — CRUD de pratos
│       ├── orders/             — CRUD de pedidos
│       ├── users/              — Perfil e listagem de usuários
│       └── password/
│           ├── forgot/         — POST /api/password/forgot
│           └── reset/          — POST /api/password/reset
├── components/                 ← Componentes React reutilizáveis
├── lib/
│   ├── auth.ts                 ← Configuração NextAuth (providers, callbacks)
│   ├── prisma.ts               ← Cliente Prisma singleton
│   ├── email.ts                ← Envio de e-mail via Resend
│   ├── validations.ts          ← Schemas Zod
│   ├── store/                  ← Zustand (cart, favorites, adminOrders)
│   ├── middleware/
│   │   ├── auth.ts             ← Middleware JWT (requireAuth, requireAdmin)
│   │   └── errorHandler.ts     ← Handler global de erros da API
│   └── errors/index.ts         ← Classes de erro customizadas
├── proxy.ts                    ← Controle de acesso por rota (Next.js middleware)
├── __tests__/
│   ├── unit/                   ← Testes unitários (Jest)
│   ├── integration/            ← Testes de integração (Jest)
│   └── components/             ← Testes de componentes (React Testing Library)
prisma/
├── schema.prisma               ← Models e migrações
└── seed.ts                     ← Dados iniciais
.github/
└── workflows/
    └── ci.yml                  ← Pipeline CI/CD (GitHub Actions)
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)

### 1. Clone e instale as dependências

```bash
git clone https://github.com/JoaoFabris/Meal-Delivery.git
cd Meal-Delivery
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/foodapp"
DIRECT_URL="postgresql://postgres:SUA_SENHA@localhost:5432/foodapp"  # conexão direta (migrations)

# NextAuth — gere com: openssl rand -base64 32
AUTH_SECRET="sua-chave-secreta-longa-e-aleatoria"

# Google OAuth — console.cloud.google.com
AUTH_GOOGLE_ID="seu-google-client-id"
AUTH_GOOGLE_SECRET="seu-google-client-secret"

# Admin — e-mails separados por vírgula
ADMIN_EMAILS="admin@exemplo.com"

# URL base da aplicação
NEXTAUTH_URL="http://localhost:3000"

# JWT para API REST
JWT_SECRET="sua-chave-jwt-longa-e-aleatoria"

# E-mail transacional (opcional — sem isso o link é logado no terminal)
RESEND_API_KEY="re_..."
EMAIL_FROM="FoodApp <noreply@seudominio.com>"

# Assistente de IA (opcional)
GROQ_API_KEY="gsk_..."
```

### 3. Configure o banco de dados

```bash
# Cria as tabelas
npm run prisma:migrate

# (Opcional) Popula com dados iniciais
npm run prisma:seed
```

### 4. Inicie o servidor

```bash
npm run dev
```

Acesse em `http://localhost:3000`

### Comandos úteis

```bash
npm run prisma:studio    # Interface visual do banco
npm run prisma:migrate   # Nova migration
npm run prisma:seed      # Repovoar o banco
npx prisma generate      # Regenerar o Prisma Client
```

---

## 🧪 Testes Automatizados

O projeto conta com uma suíte completa de testes implementada com **Jest** e **React Testing Library**, cobrindo back-end e front-end.

### Executar os testes

```bash
# Todos os testes
npm test

# Apenas testes de back-end (unitários + integração)
npm test -- --testPathPatterns="unit|integration"

# Apenas testes de componentes (front-end)
npm test -- --testPathPatterns="components"

# Com relatório de cobertura
npm test -- --coverage

# Modo watch (desenvolvimento)
npm test -- --watch
```

### Estrutura dos testes

```
src/__tests__/
├── unit/
│   ├── auth.middleware.test.ts     ← generateToken, verifyToken, requireAuth, requireAdmin
│   ├── error.handler.test.ts       ← handleApiError, classes de erro customizadas
│   └── validations.test.ts         ← todos os schemas Zod
├── integration/
│   ├── auth.api.test.ts            ← POST /api/auth/register e login
│   ├── meals.api.test.ts           ← CRUD completo /api/meals
│   ├── orders.api.test.ts          ← CRUD completo /api/orders
│   ├── password.api.test.ts        ← POST /api/password/forgot e reset
│   └── users.api.test.ts           ← GET|PUT /api/users/me
└── components/
    ├── Header.test.tsx             ← Rendering condicional, busca, signOut
    ├── SearchBar.test.tsx          ← Digitação, debounce, limpar campo
    ├── MealCard.test.tsx           ← Renderização, favoritar, adicionar ao carrinho
    ├── CartItem.test.tsx           ← Quantidade, remoção de item
    └── UserLoginClient.test.tsx    ← Toggle login/registro, fetch mockado, erros
```

### Cobertura de código

| Métrica    | Resultado | Mínimo exigido |
| ---------- | --------- | -------------- |
| Statements | **97.3%** | 80% ✅         |
| Branches   | **85.0%** | 80% ✅         |
| Functions  | **96.5%** | 80% ✅         |
| Lines      | **97.6%** | 80% ✅         |

> **246 testes** | **19 suites** | **2 projetos** (backend + frontend)

### Estratégias utilizadas

- **Mocks** — Prisma Client, bcrypt, NextAuth, fetch, next/navigation
- **Fixtures** — objetos de dados reutilizáveis por suite
- **Testes unitários** — funções isoladas sem dependências externas
- **Testes de integração** — endpoints completos com Prisma mockado
- **Testes de componente** — comportamento do usuário com React Testing Library

---

## ⚙️ CI/CD — GitHub Actions

O projeto possui um pipeline automatizado em `.github/workflows/ci.yml` que é executado a cada `push` ou `pull request` nas branches `main` e `dev`.

### Fluxo do pipeline

```
git push
    │
    ▼
Job 1 — Testes e Cobertura (~1m 20s)
    ├── Instala dependências (npm ci)
    ├── Gera Prisma Client
    ├── Aplica migrações no banco de teste
    ├── Executa os 246 testes com cobertura
    └── Publica relatório de cobertura como artefato
            │
            ▼ (se passou)
Job 2 — Build da Aplicação (~1m)
    ├── Instala dependências
    ├── Gera Prisma Client
    └── Executa npm run build
            │
            ▼ (se passou + branch main)
Job 3 — Deploy Produção (Vercel)
    ├── Aplica migrações no banco de produção (prisma migrate deploy)
    └── vercel pull → vercel build --prod → vercel deploy --prebuilt --prod
```

> Os passos do Job 3 só rodam se os secrets estiverem configurados; sem eles, o job emite um aviso e o pipeline continua verde. Em paralelo, a **integração Git da Vercel** publica automaticamente cada push na `main` (produção) e gera *Preview Deployments* para outras branches e PRs. Detalhes em [`docs/deploy.md`](./docs/deploy.md).

### Acompanhar o pipeline

Acesse: [github.com/JoaoFabris/Meal-Delivery/actions](https://github.com/JoaoFabris/Meal-Delivery/actions)

### Configurar deploy via GitHub Actions (opcional)

Adicione os secrets em **Settings → Secrets and variables → Actions**:

| Secret              | Como obter                                              |
| ------------------- | ------------------------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com → Account Settings → Tokens                  |
| `VERCEL_ORG_ID`     | `.vercel/project.json` (gerado por `npx vercel link`)   |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` (gerado por `npx vercel link`)   |
| `PROD_DATABASE_URL` | URL de conexão (pooled) do banco de produção            |
| `PROD_DIRECT_URL`   | URL de conexão direta do banco de produção              |

---

## 🔐 Autenticação

O sistema oferece dois fluxos de autenticação independentes:

### Google OAuth

Clique em "Continuar com Google" na página `/login`. A conta é criada automaticamente no banco na primeira vez.

### E-mail + Senha

Registre-se ou faça login diretamente na página `/login`. A senha é armazenada com hash bcrypt (custo 10).

Após autenticar por qualquer um dos dois fluxos, a sessão é mantida via **JWT** (NextAuth).

### Autenticação via API (JWT próprio)

Para consumir a API diretamente (ex: via Postman), use os endpoints REST:

```bash
# 1. Registrar
POST /api/auth/register
{ "name": "João", "email": "joao@email.com", "password": "senha123" }

# 2. Login
POST /api/auth/login
{ "email": "joao@email.com", "password": "senha123" }

# 3. Usar o token retornado
Authorization: Bearer <token>
```

### Recuperação de senha

```bash
# 1. Solicitar o link
POST /api/password/forgot
{ "email": "joao@email.com" }

# 2. Redefinir com o token recebido por e-mail (ou pelo terminal em dev)
POST /api/password/reset
{ "token": "<token>", "password": "novaSenha123" }
```

> Em desenvolvimento (sem `RESEND_API_KEY`), o link de recuperação é exibido no terminal.

### Credenciais do seed (para testes)

Criadas pelo `npm run prisma:seed`. **Use apenas em desenvolvimento** — se o seed for rodado em produção, troque essas senhas ou trate-as como contas de demonstração.

| Tipo  | E-mail            | Senha    |
| ----- | ----------------- | -------- |
| Admin | admin@foodapp.com | admin123 |
| User  | user@foodapp.com  | user123  |

---

## 📡 Endpoints da API

> Documentação interativa completa (parâmetros, exemplos de requisição/resposta e códigos de status) disponível em [`/api-docs`](#-documentação-adicional) via Swagger/OpenAPI.

### 🔑 Auth

| Método | Endpoint               | Descrição           | Auth |
| ------ | ---------------------- | ------------------- | ---- |
| POST   | `/api/auth/register`   | Registrar usuário   | —    |
| POST   | `/api/auth/login`      | Login (retorna JWT) | —    |
| POST   | `/api/password/forgot` | Solicitar reset     | —    |
| POST   | `/api/password/reset`  | Redefinir senha     | —    |

#### `POST /api/auth/register`

```json
// Requisição
{ "name": "João Silva", "email": "joao@email.com", "password": "senha123" }

// Resposta 201
{
  "message": "Usuário registrado com sucesso.",
  "user": { "id": "...", "name": "João Silva", "email": "...", "role": "USER", "createdAt": "..." },
  "token": "eyJhbGc..."
}
```

#### `POST /api/auth/login`

```json
// Requisição
{ "email": "joao@email.com", "password": "senha123" }

// Resposta 200
{
  "message": "Login realizado com sucesso.",
  "user": { "id": "...", "name": "João Silva", "email": "...", "role": "USER" },
  "token": "eyJhbGc..."
}
```

---

### 🍽️ Meals (Pratos)

| Método | Endpoint         | Descrição       | Auth     |
| ------ | ---------------- | --------------- | -------- |
| GET    | `/api/meals`     | Listar pratos   | —        |
| GET    | `/api/meals/:id` | Buscar prato    | —        |
| POST   | `/api/meals`     | Criar prato     | 🔒 Admin |
| PUT    | `/api/meals/:id` | Atualizar prato | 🔒 Admin |
| DELETE | `/api/meals/:id` | Remover prato   | 🔒 Admin |

**Query params** em `GET /api/meals`: `?category=Beef`, `?search=pizza`, `?available=true`

---

### 📦 Orders (Pedidos)

| Método | Endpoint          | Descrição        | Auth    |
| ------ | ----------------- | ---------------- | ------- |
| GET    | `/api/orders`     | Listar pedidos   | 🔒 User |
| POST   | `/api/orders`     | Criar pedido     | 🔒 User |
| GET    | `/api/orders/:id` | Buscar pedido    | 🔒 User |
| PUT    | `/api/orders/:id` | Atualizar status | 🔒 User |

> USER vê apenas seus próprios pedidos. ADMIN vê todos.

**Status disponíveis:** `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERED` / `CANCELLED`

> Transições validadas no servidor (`src/lib/orderStatus.ts`): o status só avança, `CANCELLED` só é possível antes da entrega, e `DELIVERED`/`CANCELLED` são finais. Tentativas inválidas retornam `400 VALIDATION_ERROR`.

---

### 👤 Users (Usuários)

| Método | Endpoint        | Descrição        | Auth     |
| ------ | --------------- | ---------------- | -------- |
| GET    | `/api/users/me` | Meu perfil       | 🔒 User  |
| PUT    | `/api/users/me` | Atualizar perfil | 🔒 User  |
| GET    | `/api/users`    | Listar usuários  | 🔒 Admin |

---

## ❌ Tratamento de Erros

Todos os erros seguem formato padronizado:

```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Dados inválidos na requisição.",
    "details": [{ "field": "email", "message": "E-mail inválido" }]
  }
}
```

| Código | Tipo                    | Quando ocorre                       |
| ------ | ----------------------- | ----------------------------------- |
| 400    | `VALIDATION_ERROR`      | Dados inválidos na requisição       |
| 401    | `UNAUTHORIZED`          | Token ausente, inválido ou expirado |
| 403    | `FORBIDDEN`             | Sem permissão para o recurso        |
| 404    | `NOT_FOUND`             | Recurso não encontrado              |
| 409    | `CONFLICT`              | E-mail já cadastrado                |
| 500    | `INTERNAL_SERVER_ERROR` | Erro inesperado no servidor         |

---

## 🗄️ Banco de Dados

```
users ──────────< orders >────────── order_items >──── meals
  │                                                      │
  └──────────────< favorites >───────────────────────────┘
  │
  └──< accounts >               (NextAuth OAuth)
  └──< sessions >               (NextAuth sessões)
  └──< password_reset_tokens >  (recuperação de senha)
```

### Migrações aplicadas

| Migration                                 | Descrição                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `20260426214930_password_opcional`        | `password` vira nullable                                                         |
| `20260427195714_add_password_reset_token` | Tabela `password_reset_tokens`                                                   |
| `20260427203117_add_nextauth_tables`      | Tabelas `accounts`, `sessions`, `verification_tokens` + campo `image` em `users` |
| `20260618221041_remove_meal_fk_from_favorites` | Remove FK de `favorites.mealId` (pratos vêm da TheMealDB)                   |
| `20260620162808_remove_meal_fk_from_order_items` | Remove FK de `order_items.mealId` (pratos vêm da TheMealDB)               |

---

## 🛠️ Tecnologias

| Tecnologia            | Versão   | Uso                                       |
| --------------------- | -------- | ----------------------------------------- |
| Next.js               | 16.2.3   | Framework full-stack / App Router         |
| React                 | 19       | Interface do usuário                      |
| TypeScript            | 5+       | Tipagem estática                          |
| Prisma ORM            | 6.19.x   | ORM / migrations / pool de conexões       |
| PostgreSQL            | 15+      | Banco de dados relacional                 |
| NextAuth              | 5 (beta) | Autenticação OAuth + Credentials          |
| bcryptjs              | 3+       | Hash de senhas                            |
| jsonwebtoken          | 9+       | JWT próprio para consumo da API           |
| Zod                   | 4+       | Validação de schemas                      |
| Zustand               | 5+       | Gerenciamento de estado (cart, favorites) |
| Resend                | 6+       | Envio de e-mail transacional              |
| shadcn/ui             | —        | Componentes de UI                         |
| Tailwind CSS          | 4+       | Estilização                               |
| Sonner                | 2+       | Notificações toast                        |
| Jest                  | 30+      | Testes unitários e de integração          |
| React Testing Library | —        | Testes de componentes                     |
| GitHub Actions        | —        | CI/CD automatizado                        |

---

## 🤖 Assistente de Recomendação com IA

O FoodApp conta com um widget de chat flutuante powered by **Groq (LLaMA 3.3 70B)** que recomenda pratos personalizados para cada usuário.

### Funcionalidades

- Recomendações baseadas no cardápio real do banco de dados
- Contexto personalizado: nome do usuário, histórico de pedidos e favoritos
- Streaming de resposta em tempo real
- Usuários não logados veem uma mensagem convidando ao login

### Como funciona

```
Usuário → Widget flutuante (client)
        → POST /api/chat/recommend (server-side, autenticado)
        → Groq API com cardápio + contexto do usuário como system prompt
        → Resposta streamada de volta ao widget
```

Adicione no `.env`:

```env
GROQ_API_KEY=gsk_sua_chave_groq_aqui
```

> A chave é obtida em [console.groq.com](https://console.groq.com).

---

## 🤝 Fluxo de Contribuição e Boas Práticas

### Branches

- `main` — código estável, em produção. Protegida; só recebe merge via PR aprovado.
- `dev` — branch de integração para features em desenvolvimento.
- `feature/<nome-curto>` — uma branch por funcionalidade, criada a partir de `dev` (ex.: `feature/favoritos`, `feature/swagger-docs`).
- `fix/<nome-curto>` — correções pontuais de bugs.

### Fluxo de trabalho

```
1. git checkout dev && git pull
2. git checkout -b feature/minha-feature
3. Desenvolver + escrever/atualizar testes
4. npm run lint        # sem erros
5. npm test -- --coverage   # cobertura ≥ 80% mantida
6. git commit -m "feat: descrição curta"
7. git push origin feature/minha-feature
8. Abrir Pull Request para dev
9. CI (GitHub Actions) precisa passar (testes + build)
10. Revisão de código antes do merge
```

### Padrão de commits

Convenção baseada em [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo     | Uso                                      |
| ----------- | ---------------------------------------- |
| `feat:`     | Nova funcionalidade                      |
| `fix:`      | Correção de bug                          |
| `test:`     | Adição ou ajuste de testes               |
| `docs:`     | Alterações em documentação               |
| `refactor:` | Refatoração sem mudança de comportamento |
| `chore:`    | Tarefas de manutenção (deps, configs)    |

### Boas práticas do projeto

- Nenhum PR é mergeado com o pipeline de CI quebrado.
- Cobertura de testes não pode cair abaixo de 80% (statements/branches/functions/lines).
- Validação de entrada sempre via schemas Zod (`lib/validations.ts`).
- Erros de API sempre lançados como classes customizadas de `lib/errors` e tratados pelo `errorHandler` central — nunca `throw` genérico numa rota.
- Regras de acesso (`requireAuth` / `requireAdmin`) aplicadas no middleware, não replicadas manualmente em cada rota.

---

## 📚 Documentação Adicional

| Recurso                                   | Link                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 🌐 Aplicação publicada                    | https://meal-delivery-eight.vercel.app                                                             |
| 🔌 Documentação da API (Swagger/OpenAPI)  | [`/api-docs`](https://meal-delivery-eight.vercel.app/api-docs)                                     |
| 🏗️ Arquitetura                            | [`docs/arquitetura.md`](./docs/arquitetura.md)                                                     |
| 🗄️ Modelo de dados                        | [`docs/modelo-de-dados.md`](./docs/modelo-de-dados.md)                                             |
| 🔀 Fluxos de trabalho                     | [`docs/fluxos-de-trabalho.md`](./docs/fluxos-de-trabalho.md)                                       |
| 🚀 Deploy                                 | [`docs/deploy.md`](./docs/deploy.md)                                                               |
| 🛠️ Manual de manutenção                   | [`docs/manutencao.md`](./docs/manutencao.md)                                                       |
| 👤 Manual do usuário                      | [`docs/manual-do-usuario.md`](./docs/manual-do-usuario.md)                                         |
| 🔐 Manual do administrador                | [`docs/manual-do-admin.md`](./docs/manual-do-admin.md)                                             |
| 🧯 Troubleshooting                        | [`docs/troubleshooting.md`](./docs/troubleshooting.md)                                             |
| 🎥 Vídeo de apresentação                  | [YouTube](https://youtu.be/Fabw1FO-yZA)                                                            |
| ⚙️ Pipeline CI/CD                         | [github.com/JoaoFabris/Meal-Delivery/actions](https://github.com/JoaoFabris/Meal-Delivery/actions) |
