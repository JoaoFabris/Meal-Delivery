# 🍔 FoodApp

Aplicação full-stack de pedidos de refeições desenvolvida como parte da **Atividade 2 — PPE III**.

Combina uma interface web moderna com uma API RESTful completa, autenticação dupla (Google OAuth + e-mail/senha com JWT), banco de dados PostgreSQL via Prisma ORM, recuperação de senha por e-mail e controle de acesso por papel (USER / ADMIN).

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
prisma/
├── schema.prisma               ← Models e migrações
└── seed.ts                     ← Dados iniciais
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)

### 1. Clone e instale as dependências

```bash
git clone <url-do-repositorio>
cd foodapp
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
|-------|-------------------|----------|
| Admin | admin@foodapp.com | admin123 |
| User  | user@foodapp.com  | user123  |

---

## 📡 Endpoints da API

### 🔑 Auth

| Método | Endpoint               | Descrição              | Auth |
|--------|------------------------|------------------------|------|
| POST   | `/api/auth/register`   | Registrar usuário      | —    |
| POST   | `/api/auth/login`      | Login (retorna JWT)    | —    |
| POST   | `/api/password/forgot` | Solicitar reset        | —    |
| POST   | `/api/password/reset`  | Redefinir senha        | —    |

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

| Método | Endpoint          | Descrição             | Auth    |
|--------|-------------------|-----------------------|---------|
| GET    | `/api/meals`      | Listar pratos         | —       |
| GET    | `/api/meals/:id`  | Buscar prato          | —       |
| POST   | `/api/meals`      | Criar prato           | 🔒 Admin |
| PUT    | `/api/meals/:id`  | Atualizar prato       | 🔒 Admin |
| DELETE | `/api/meals/:id`  | Remover prato         | 🔒 Admin |

**Query params** em `GET /api/meals`: `?category=Beef`, `?search=pizza`, `?available=true`

```json
// GET /api/meals — Resposta 200
{
  "meals": [
    {
      "id": "meal-1",
      "name": "X-Burguer Clássico",
      "price": 28.90,
      "category": "Burgers",
      "imageUrl": "https://...",
      "available": true
    }
  ],
  "total": 4
}
```

```json
// POST /api/meals — Corpo
{
  "name": "Novo Prato",
  "description": "Descrição",
  "price": 35.90,
  "category": "Chicken",
  "imageUrl": "https://exemplo.com/img.jpg",
  "available": true
}
```

---

### 📦 Orders (Pedidos)

| Método | Endpoint            | Descrição                  | Auth      |
|--------|---------------------|----------------------------|-----------|
| GET    | `/api/orders`       | Listar pedidos             | 🔒 User   |
| POST   | `/api/orders`       | Criar pedido               | 🔒 User   |
| GET    | `/api/orders/:id`   | Buscar pedido              | 🔒 User   |
| PUT    | `/api/orders/:id`   | Atualizar status           | 🔒 User   |

> USER vê apenas seus próprios pedidos. ADMIN vê todos.  
> USER só pode cancelar (`CANCELLED`). ADMIN pode usar qualquer status.

```json
// POST /api/orders — Corpo
{ "items": [{ "mealId": "meal-1", "quantity": 2 }, { "mealId": "meal-3", "quantity": 1 }] }

// Resposta 201
{
  "message": "Pedido criado com sucesso.",
  "order": { "id": "...", "total": 79.70, "status": "PENDING", "items": [...] }
}
```

**Status disponíveis:** `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERED` / `CANCELLED`

---

### 👤 Users (Usuários)

| Método | Endpoint          | Descrição              | Auth      |
|--------|-------------------|------------------------|-----------|
| GET    | `/api/users/me`   | Meu perfil             | 🔒 User   |
| PUT    | `/api/users/me`   | Atualizar perfil       | 🔒 User   |
| GET    | `/api/users`      | Listar usuários        | 🔒 Admin  |

```json
// GET /api/users/me — Resposta 200
{
  "user": {
    "id": "...",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER",
    "createdAt": "...",
    "_count": { "orders": 3, "favorites": 5 }
  }
}
```

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

| Código | Tipo                    | Quando ocorre                        |
|--------|-------------------------|--------------------------------------|
| 400    | `VALIDATION_ERROR`      | Dados inválidos na requisição        |
| 401    | `UNAUTHORIZED`          | Token ausente, inválido ou expirado  |
| 403    | `FORBIDDEN`             | Sem permissão para o recurso         |
| 404    | `NOT_FOUND`             | Recurso não encontrado               |
| 409    | `CONFLICT`              | E-mail já cadastrado                 |
| 500    | `INTERNAL_SERVER_ERROR` | Erro inesperado no servidor          |

---

## 🗄️ Banco de Dados

```
users ──────────< orders >────────── order_items >──── meals
  │                                                      │
  └──────────────< favorites >───────────────────────────┘
  │
  └──< accounts >   (NextAuth OAuth)
  └──< sessions >   (NextAuth sessões)
  └──< password_reset_tokens >  (recuperação de senha)
```

### Migrações aplicadas

| Migration | Descrição |
|---|---|
| `20260426214930_password_opcional` | `password` vira nullable |
| `20260427195714_add_password_reset_token` | Tabela `password_reset_tokens` |
| `20260427203117_add_nextauth_tables` | Tabelas `accounts`, `sessions`, `verification_tokens` + campo `image` em `users` |

---

## 🛠️ Tecnologias

| Tecnologia        | Versão   | Uso                                         |
|-------------------|----------|---------------------------------------------|
| Next.js           | 16.2.3   | Framework full-stack / App Router           |
| React             | 19       | Interface do usuário                        |
| TypeScript        | 5+       | Tipagem estática                            |
| Prisma ORM        | 6.19.x   | ORM / migrations / pool de conexões         |
| PostgreSQL        | 15+      | Banco de dados relacional                   |
| NextAuth          | 5 (beta) | Autenticação OAuth + Credentials            |
| bcryptjs          | 3+       | Hash de senhas                              |
| jsonwebtoken      | 9+       | JWT próprio para consumo da API             |
| Zod               | 4+       | Validação de schemas                        |
| Zustand           | 5+       | Gerenciamento de estado (cart, favorites)   |
| Resend            | 6+       | Envio de e-mail transacional                |
| shadcn/ui         | —        | Componentes de UI                           |
| Tailwind CSS      | 4+       | Estilização                                 |
| Sonner            | 2+       | Notificações toast                          |