# 🍔 FoodApp — Back-end API

Back-end do FoodApp desenvolvido como parte da **Atividade 2 — PPE III**.  
Implementa uma API RESTful completa com autenticação JWT, banco de dados PostgreSQL via Prisma ORM e tratamento centralizado de erros.

---

## 🏗️ Arquitetura

O projeto segue o padrão em camadas integrado ao **Next.js App Router**, organizando responsabilidades da seguinte forma:

```
src/
├── app/api/                  ← Routes (endpoints da API)
│   ├── auth/
│   │   ├── register/route.ts   — POST /api/auth/register
│   │   └── login/route.ts      — POST /api/auth/login
│   ├── meals/
│   │   ├── route.ts            — GET /api/meals | POST /api/meals
│   │   └── [id]/route.ts       — GET | PUT | DELETE /api/meals/:id
│   ├── orders/
│   │   ├── route.ts            — GET /api/orders | POST /api/orders
│   │   └── [id]/route.ts       — GET | PUT /api/orders/:id
│   └── users/
│       ├── route.ts            — GET /api/users (admin)
│       └── me/route.ts         — GET | PUT /api/users/me
├── lib/
│   ├── prisma.ts               ← Model (cliente Prisma singleton)
│   ├── validations.ts          ← Services (schemas Zod / regras de negócio)
│   ├── middleware/
│   │   ├── auth.ts             ← Middleware JWT (requireAuth, requireAdmin)
│   │   └── errorHandler.ts     ← Middleware global de erros
│   └── errors/
│       └── index.ts            ← Classes de erro customizadas
prisma/
├── schema.prisma               ← Definição dos models e migrações
└── seed.ts                     ← Script de população inicial
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou via Docker)
- npm ou yarn

### 1. Clone e instale as dependências

```bash
git clone <url-do-repositorio>
cd foodapp
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/foodapp"
JWT_SECRET="sua-chave-secreta-longa-e-aleatoria"
```

### 3. Configure o banco de dados

```bash
# Cria as tabelas no banco de dados
npx prisma migrate dev --name init

# (Opcional) Popula o banco com dados iniciais
npx prisma db seed
```

### 4. Inicie o servidor

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000/api`

### Comandos úteis

```bash
npx prisma studio          # Interface visual do banco de dados
npx prisma migrate reset   # Reseta e recria o banco
npx prisma generate        # Regenera o Prisma Client
```

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Token)** para autenticação.

1. Registre-se em `POST /api/auth/register` ou faça login em `POST /api/auth/login`
2. Copie o `token` da resposta
3. Envie o token no header de todas as requisições protegidas:

```
Authorization: Bearer <seu-token-aqui>
```

**Credenciais do seed (para testes):**

| Tipo  | E-mail               | Senha    |
|-------|----------------------|----------|
| Admin | admin@foodapp.com    | admin123 |
| User  | user@foodapp.com     | user123  |

---

## 📡 Endpoints da API

### 🔑 Auth

#### `POST /api/auth/register` — Registrar usuário

**Corpo da requisição:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta 201:**
```json
{
  "message": "Usuário registrado com sucesso.",
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGc..."
}
```

---

#### `POST /api/auth/login` — Login

**Corpo da requisição:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta 200:**
```json
{
  "message": "Login realizado com sucesso.",
  "user": { "id": "...", "name": "João Silva", "email": "...", "role": "USER" },
  "token": "eyJhbGc..."
}
```

---

### 🍽️ Meals (Pratos)

#### `GET /api/meals` — Listar pratos *(público)*

**Query params opcionais:** `?category=Burgers`, `?search=pizza`, `?available=true`

**Resposta 200:**
```json
{
  "meals": [
    {
      "id": "meal-1",
      "name": "X-Burguer Clássico",
      "description": "Hambúrguer artesanal...",
      "price": 28.90,
      "category": "Burgers",
      "imageUrl": "https://...",
      "available": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 4
}
```

---

#### `GET /api/meals/:id` — Buscar prato *(público)*

**Resposta 200:**
```json
{
  "meal": { "id": "meal-1", "name": "X-Burguer Clássico", ... }
}
```

---

#### `POST /api/meals` — Criar prato 🔒 *(admin)*

**Header:** `Authorization: Bearer <token>`

**Corpo:**
```json
{
  "name": "Novo Prato",
  "description": "Descrição do prato",
  "price": 35.90,
  "category": "Chicken",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "available": true
}
```

**Resposta 201:**
```json
{
  "message": "Prato criado com sucesso.",
  "meal": { "id": "...", "name": "Novo Prato", ... }
}
```

---

#### `PUT /api/meals/:id` — Atualizar prato 🔒 *(admin)*

**Header:** `Authorization: Bearer <token>`

**Corpo** (todos os campos são opcionais):
```json
{
  "price": 39.90,
  "available": false
}
```

---

#### `DELETE /api/meals/:id` — Remover prato 🔒 *(admin)*

**Header:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{ "message": "Prato removido com sucesso." }
```

---

### 📦 Orders (Pedidos)

#### `GET /api/orders` — Listar pedidos 🔒

**Header:** `Authorization: Bearer <token>`

> USER vê apenas seus pedidos. ADMIN vê todos.

**Resposta 200:**
```json
{
  "orders": [
    {
      "id": "...",
      "status": "PENDING",
      "total": 57.80,
      "createdAt": "...",
      "user": { "id": "...", "name": "João", "email": "..." },
      "items": [
        {
          "id": "...",
          "quantity": 2,
          "price": 28.90,
          "meal": { "id": "meal-1", "name": "X-Burguer Clássico", "imageUrl": "..." }
        }
      ]
    }
  ],
  "total": 1
}
```

---

#### `POST /api/orders` — Criar pedido 🔒

**Header:** `Authorization: Bearer <token>`

**Corpo:**
```json
{
  "items": [
    { "mealId": "meal-1", "quantity": 2 },
    { "mealId": "meal-3", "quantity": 1 }
  ]
}
```

> O total é calculado automaticamente com os preços cadastrados.

**Resposta 201:**
```json
{
  "message": "Pedido criado com sucesso.",
  "order": { "id": "...", "total": 79.70, "status": "PENDING", "items": [...] }
}
```

---

#### `GET /api/orders/:id` — Buscar pedido 🔒

**Header:** `Authorization: Bearer <token>`

---

#### `PUT /api/orders/:id` — Atualizar status 🔒

**Header:** `Authorization: Bearer <token>`

**Corpo:**
```json
{ "status": "CONFIRMED" }
```

> Status disponíveis: `PENDING`, `CONFIRMED`, `PREPARING`, `DELIVERED`, `CANCELLED`  
> USER só pode usar `CANCELLED` em seus próprios pedidos.

---

### 👤 Users (Usuários)

#### `GET /api/users/me` — Meu perfil 🔒

**Header:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
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

#### `PUT /api/users/me` — Atualizar perfil 🔒

**Header:** `Authorization: Bearer <token>`

**Corpo** (campos opcionais):
```json
{
  "name": "João Santos",
  "email": "novo@email.com"
}
```

---

#### `GET /api/users` — Listar usuários 🔒 *(admin)*

**Header:** `Authorization: Bearer <token>`

---

## ❌ Tratamento de Erros

Todos os erros seguem o formato padronizado:

```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Dados inválidos na requisição.",
    "details": [
      { "field": "email", "message": "E-mail inválido" }
    ]
  }
}
```

| Código | Tipo                   | Quando ocorre                          |
|--------|------------------------|----------------------------------------|
| 400    | `VALIDATION_ERROR`     | Dados inválidos na requisição          |
| 401    | `UNAUTHORIZED`         | Token ausente, inválido ou expirado    |
| 403    | `FORBIDDEN`            | Sem permissão para o recurso           |
| 404    | `NOT_FOUND`            | Recurso não encontrado                 |
| 409    | `CONFLICT`             | E-mail já cadastrado, duplicidade      |
| 500    | `INTERNAL_SERVER_ERROR`| Erro inesperado no servidor            |

---

## 🛠️ Tecnologias

| Tecnologia        | Versão  | Uso                                    |
|-------------------|---------|----------------------------------------|
| Next.js           | 15+     | Framework full-stack / API Routes      |
| TypeScript        | 5+      | Tipagem estática                       |
| Prisma ORM        | 5+      | ORM / migrations / pool de conexões    |
| PostgreSQL        | 15+     | Banco de dados relacional              |
| bcryptjs          | 2.4+    | Hash de senhas                         |
| jsonwebtoken      | 9+      | Geração e verificação de JWT           |
| Zod               | 3+      | Validação de schemas                   |

---

## 🗄️ Banco de Dados — Diagrama

```
users ──────────< orders >────────── order_items >──── meals
  │                                                      │
  └──────────────< favorites >───────────────────────────┘
```

**Models:**
- `User` — Usuários com role USER ou ADMIN
- `Meal` — Pratos com preço, categoria e disponibilidade  
- `Order` — Pedidos com status e total calculado
- `OrderItem` — Itens do pedido (relação Meal × Order)
- `Favorite` — Pratos favoritos por usuário
