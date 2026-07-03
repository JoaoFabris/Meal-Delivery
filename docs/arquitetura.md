# Arquitetura do Sistema

## Visão geral

O FoodApp é uma aplicação **full-stack monolítica** construída sobre o **Next.js App Router**, que unifica front-end (React Server/Client Components) e back-end (API Routes) num único projeto e deploy. Não há separação física entre "frontend" e "backend" — ambos vivem em `src/app/`, diferenciados por convenção de pastas (`app/api/*` são rotas de API; o restante são páginas).

```mermaid
flowchart TB
    subgraph Client["Navegador"]
        UI["React Components<br/>(Client + Server Components)"]
    end

    subgraph NextServer["Next.js App Router"]
        Middleware["proxy.ts<br/>(middleware de rota)"]
        Pages["Páginas<br/>(Server Components)"]
        API["API Routes<br/>src/app/api/*"]
        AuthMW["lib/middleware/auth.ts<br/>(requireAuth / requireAdmin)"]
        ErrorH["lib/middleware/errorHandler.ts"]
    end

    subgraph DataLayer["Camada de Dados"]
        Prisma["Prisma Client<br/>(lib/prisma.ts)"]
        DB[("PostgreSQL")]
    end

    subgraph External["Serviços Externos"]
        MealDB["TheMealDB API<br/>(catálogo de pratos)"]
        Google["Google OAuth"]
        Resend["Resend<br/>(e-mail transacional)"]
        Groq["Groq API<br/>(LLaMA 3.3 — chat de recomendação)"]
    end

    UI -->|"requisição HTTP"| Middleware
    Middleware -->|"rota liberada"| Pages
    Middleware -->|"rota liberada"| API
    Pages -->|"fetch client-side"| API
    API --> AuthMW
    AuthMW --> ErrorH
    ErrorH --> Prisma
    Prisma --> DB

    Pages -.->|"cardápio"| MealDB
    API -.->|"login social"| Google
    API -.->|"reset de senha"| Resend
    API -.->|"recomendação"| Groq

    style Client fill:#fff3e0
    style NextServer fill:#e3f2fd
    style DataLayer fill:#e8f5e9
    style External fill:#fce4ec
```

---

## Camadas

### 1. Middleware de rota (`src/proxy.ts`)

É o primeiro ponto de contato de toda requisição a rotas protegidas. Antes mesmo de a página ou API ser processada, o middleware lê o token de sessão (cookie do NextAuth) e decide:

- Bloqueia `/admin/*` para quem não tem `token.isAdmin`.
- Bloqueia `/cart` e `/profile` para quem não está autenticado.
- Redireciona usuário já logado para longe de `/login` e `/admin/login`.

Isso evita duplicar checagem de autenticação em cada página individualmente.

### 2. Páginas (Server Components)

A maioria das páginas (`page.tsx`) são **Server Components** — rodam no servidor, buscam dados diretamente (ex: `getCategories()`, `getMealById()`) e enviam HTML já pronto ao navegador. Componentes que precisam de interatividade (formulários, estado local, hooks) são marcados `'use client'` e ficam em arquivos `*Client.tsx` separados (padrão usado em `HomePage` → nenhum client necessário, mas em `AdminDashboardPage` → `AdminDashboardClient`, `ProfilePage` → `ProfilePageClient`).

### 3. API Routes (`src/app/api/*`)

Implementam a API REST consumida tanto pelo próprio front-end (via `fetch`) quanto por clientes externos (Postman, apps mobile futuros). Cada rota segue o mesmo padrão:

```
Request → requireAuth/requireAdmin (se protegida) → validação Zod → lógica de negócio (Prisma) → resposta padronizada
```

Erros lançados em qualquer ponto são capturados pelo `errorHandler` central e convertidos no formato padronizado de erro (ver `README.md`, seção "Tratamento de Erros").

### 4. Camada de dados (Prisma + PostgreSQL)

`lib/prisma.ts` exporta uma instância singleton do Prisma Client, evitando esgotar conexões em ambiente serverless (padrão recomendado pela própria Vercel/Next.js). O schema e as migrações vivem em `prisma/`.

### 5. Integrações externas

| Serviço                  | Uso                                                                                 | Onde                              |
| ------------------------ | ----------------------------------------------------------------------------------- | --------------------------------- |
| **TheMealDB**            | Fonte principal do catálogo de pratos (nome, imagem, ingredientes, modo de preparo) | `lib/api/mealdb.ts`               |
| **Google OAuth**         | Login social, via NextAuth                                                          | `lib/auth.ts`                     |
| **Resend**               | Envio do e-mail de recuperação de senha                                             | `lib/email.ts`                    |
| **Groq (LLaMA 3.3 70B)** | Motor do assistente de recomendação por chat                                        | `app/api/chat/recommend/route.ts` |

Essa decisão de arquitetura — **usar uma API pública de terceiros como fonte de catálogo em vez de manter todo o cardápio no banco próprio** — reduz o esforço de popular e manter dados de pratos, ao custo de depender da disponibilidade da TheMealDB e de tratar `mealId`s "fracos" (sem FK) no banco local, como documentado em [`modelo-de-dados.md`](./modelo-de-dados.md#por-que-meal-não-tem-fk).

---

## Fluxo de uma requisição autenticada (exemplo: criar pedido)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant M as proxy.ts (middleware)
    participant P as CartPageClient
    participant A as actions.ts (Server Action)
    participant Auth as NextAuth (auth())
    participant DB as Prisma / PostgreSQL

    U->>M: Acessa /cart
    M->>M: Verifica token de sessão
    alt não autenticado
        M-->>U: Redireciona para /login
    else autenticado
        M-->>P: Libera acesso à página
        U->>P: Clica em "Finalizar pedido"
        P->>A: createOrder(items, total)
        A->>Auth: auth() — confirma sessão
        Auth-->>A: sessão válida
        A->>DB: prisma.order.create({ items, total })
        DB-->>A: pedido criado
        A-->>P: retorna order
        P-->>U: Redireciona para /cart/success
    end
```

Esse fluxo usa **Server Actions** (`'use server'` em `cart/actions.ts`) em vez de uma API Route tradicional — uma escolha do Next.js App Router que permite chamar lógica de servidor diretamente de um Client Component sem precisar montar um endpoint REST manualmente. Já o checkout via API pública (Postman, integrações externas) usa as rotas REST convencionais em `app/api/orders`.

---

## Autenticação — dois mecanismos coexistindo

O sistema tem **duas estratégias de autenticação em paralelo**, cada uma servindo um propósito diferente:

```mermaid
flowchart LR
    subgraph WebFlow["Uso via navegador (app web)"]
        direction TB
        A1["Login (Google ou credentials)"] --> A2["NextAuth"]
        A2 --> A3["Sessão via cookie JWT"]
        A3 --> A4["Server Components leem<br/>sessão com auth()"]
    end

    subgraph ApiFlow["Uso via API externa (Postman, integrações)"]
        direction TB
        B1["POST /api/auth/login"] --> B2["JWT próprio<br/>(jsonwebtoken)"]
        B2 --> B3["Cliente envia<br/>Authorization: Bearer"]
        B3 --> B4["requireAuth() valida<br/>o token manualmente"]
    end
```

Essa duplicidade existe porque o NextAuth gerencia sessão via cookies (ideal para o navegador, mas inacessível a um cliente REST externo), enquanto o JWT próprio permite que qualquer cliente HTTP (não só o navegador) se autentique contra a API. Ambos os fluxos, no fim, resolvem para o mesmo `User` no banco.

---

## Por que Next.js App Router (e não uma API separada)

Trade-offs considerados no projeto:

**A favor da abordagem monolítica adotada:**

- Um único deploy, um único pipeline de CI/CD
- Server Components eliminam boa parte do "loading spinner" tradicional (dados já vêm prontos no HTML)
- Compartilhamento de tipos TypeScript entre front e back sem duplicação

**Trade-off aceito:**

- Acoplamento maior entre UI e API — escalar o backend independentemente do frontend exigiria separar os dois no futuro
- API Routes do Next.js não são pensadas para altíssimo throughput como um serviço dedicado (Express/Fastify standalone) seria
