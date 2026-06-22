# 🍔 FoodApp

Aplicação full-stack de pedidos de refeições desenvolvida como parte das **Atividades 2 e 3 — PPE III**.

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

> **241 testes** | **18 suites** | **2 projetos** (backend + frontend)

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
    ├── Executa os 241 testes com cobertura
    └── Publica relatório de cobertura como artefato
            │
            ▼ (se passou)
Job 2 — Build da Aplicação (~1m)
    ├── Instala dependências
    ├── Gera Prisma Client
    └── Executa npm run build
            │
            ▼ (se passou + branch main)
Job 3 — Deploy Staging (Vercel)
    └── Deploy automático via Vercel CLI
```

### Acompanhar o pipeline

Acesse: [github.com/JoaoFabris/Meal-Delivery/actions](https://github.com/JoaoFabris/Meal-Delivery/actions)

### Configurar deploy no Vercel (opcional)

Para ativar o deploy automático, adicione os seguintes secrets no repositório em **Settings → Secrets → Actions**:

| Secret              | Como obter                               |
| ------------------- | ---------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com → Account Settings → Tokens   |
| `VERCEL_ORG_ID`     | `vercel env pull` ou dashboard do Vercel |
| `VERCEL_PROJECT_ID` | `vercel env pull` ou dashboard do Vercel |

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

| Tipo  | E-mail            | Senha    |
| ----- | ----------------- | -------- |
| Admin | admin@foodapp.com | admin123 |
| User  | user@foodapp.com  | user123  |

---

## 📡 Endpoints da API

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

## 🤖 Assistente de Recomendação com IA

O FoodApp conta com um widget de chat flutuante powered by **Groq (LLaMA 3.3 70B)** que recomenda pratos personalizados para cada usuário.

### Funcionalidades

- Recomendações baseadas no cardápio real do banco de dados
- Contexto personalizado: nome do usuário, histórico de pedidos e favoritos
- Streaming de resposta em tempo real
- Usuários não logados veem uma mensagem convidando ao login

### Como funciona

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

> A chave é obtida em [console.groq.com](https://console.groq.com). O nome da variável é `XAI_API_KEY` por compatibilidade com o código existente.
