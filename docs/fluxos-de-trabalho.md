# Fluxos de Trabalho

Este documento descreve, em diagramas, os principais fluxos de uso do FoodApp — do ponto de vista do usuário e do administrador.

---

## 1. Login e Registro

O usuário pode entrar por dois caminhos independentes: e-mail/senha ou Google. Registrar-se automaticamente autentica o usuário em seguida.

```mermaid
flowchart TD
    Start(["Usuário acessa /login"]) --> Choice{"Já tem conta?"}

    Choice -->|Sim| LoginMode["Modo: Entrar"]
    Choice -->|Não| RegisterMode["Modo: Criar conta"]

    LoginMode --> LoginType{"Como entrar?"}
    LoginType -->|"E-mail + senha"| LoginCreds["Preenche e-mail/senha"]
    LoginType -->|Google| LoginGoogle["Clica em 'Continuar com Google'"]

    LoginCreds --> ValidateCreds{"Credenciais válidas?"}
    ValidateCreds -->|Não| ErrorMsg["Exibe: 'E-mail ou senha inválidos'"]
    ErrorMsg --> LoginCreds
    ValidateCreds -->|Sim| Session["Sessão criada (NextAuth)"]

    LoginGoogle --> GoogleAuth["Redireciona ao Google"]
    GoogleAuth --> GoogleReturn["Google retorna com sucesso"]
    GoogleReturn --> Session

    RegisterMode --> FillForm["Preenche nome, e-mail, senha"]
    FillForm --> Submit["POST /api/auth/register"]
    Submit --> EmailTaken{"E-mail já cadastrado?"}
    EmailTaken -->|Sim| ConflictErr["Erro 409: e-mail já em uso"]
    ConflictErr --> FillForm
    EmailTaken -->|Não| CreateUser["Cria usuário (senha com hash bcrypt)"]
    CreateUser --> AutoLogin["Login automático via signIn('credentials')"]
    AutoLogin --> Session

    Session --> Redirect(["Redireciona para callbackUrl<br/>(página que o usuário tentava acessar, ou '/')"])
```

**Observações:**

- Se o usuário tentava acessar uma rota protegida (ex: `/cart`) sem estar logado, o middleware (`proxy.ts`) o envia para `/login?callbackUrl=/cart` — após autenticar, ele volta exatamente pra onde queria ir.
- A senha, quando existe, é armazenada com hash bcrypt (custo 10) — nunca em texto puro.

---

## 2. Navegar → Adicionar ao Carrinho → Finalizar Pedido

```mermaid
flowchart TD
    Home(["Home: lista de pratos"]) --> Filter["Filtra por categoria<br/>ou busca por nome"]
    Filter --> SelectMeal["Abre detalhe do prato"]

    SelectMeal --> LoggedCheck{"Está logado?"}
    LoggedCheck -->|Não| PromptLogin["Botão 'Entrar para comprar'<br/>(Google OAuth)"]
    PromptLogin --> SelectMeal

    LoggedCheck -->|Sim| SetQty["Ajusta quantidade"]
    SetQty --> AddCart["Clica 'Adicionar ao carrinho'"]
    AddCart --> LocalCart["Item salvo no cart.store<br/>(Zustand, local até o checkout)"]
    LocalCart --> ToastOk["Toast de confirmação"]
    ToastOk --> AutoRedirect["Redireciona automaticamente<br/>para /cart"]

    AutoRedirect --> Review["Revisa itens, ajusta quantidades<br/>ou remove itens"]
    Review --> Empty{"Carrinho vazio?"}
    Empty -->|Sim| EmptyState["Tela de carrinho vazio<br/>+ CTA 'Ver cardápio'"]
    Empty -->|Não| Checkout["Clica 'Finalizar pedido'"]

    Checkout --> ValidateSession["validateSessionForOrder()"]
    ValidateSession --> SessionOk{"Sessão válida?"}
    SessionOk -->|Não| SessionExpired["Mensagem: sessão expirou,<br/>faça login novamente"]
    SessionOk -->|Sim| CreateOrder["createOrder() — Server Action<br/>grava Order + OrderItems no banco"]
    CreateOrder --> ClearCart["Limpa carrinho local"]
    ClearCart --> Success(["Página /cart/success"])
```

**Observação de design:** o carrinho vive inteiramente no client (Zustand), sem persistência no banco até o momento do checkout. Isso significa que o carrinho **não sobrevive** a uma troca de dispositivo ou limpeza de cache antes de finalizar — um ponto a se considerar como próximo passo evolutivo (ver `README.md` / discussão de próximos passos na apresentação).

---

## 3. Ciclo de Vida do Pedido

```mermaid
stateDiagram-v2
    [*] --> PENDING: Pedido criado pelo usuário
    PENDING --> CONFIRMED: Admin confirma
    CONFIRMED --> PREPARING: Admin atualiza status
    PREPARING --> DELIVERED: Admin marca como entregue
    PENDING --> CANCELLED: Cancelado
    CONFIRMED --> CANCELLED: Cancelado
    PREPARING --> CANCELLED: Cancelado
    DELIVERED --> [*]
    CANCELLED --> [*]
```

- Todas as transições de status são feitas pelo **admin**, no painel `/admin/orders` (`AdminOrdersClient` → `AdminOrderCard`), via `PUT /api/orders/:id` ou `PUT /api/admin/orders/:id`.
- O usuário acompanha o status em `/profile?tab=orders`, mas não pode alterá-lo — apenas visualiza.
- Não há regra no banco impedindo "pular" estados (ex: ir de `PENDING` direto para `DELIVERED`); a validação de transição, se existir, é responsabilidade da camada de aplicação, não do schema.

---

## 4. Recuperação de Senha

```mermaid
flowchart TD
    Start(["Usuário esqueceu a senha"]) --> Forgot["/forgot-password: informa e-mail"]
    Forgot --> ApiForgot["POST /api/password/forgot"]
    ApiForgot --> GenToken["Gera PasswordResetToken<br/>(único, com expiração)"]
    GenToken --> HasResend{"RESEND_API_KEY<br/>configurada?"}
    HasResend -->|Sim| SendEmail["Envia e-mail com link<br/>via Resend"]
    HasResend -->|Não| LogTerminal["Link exibido no terminal<br/>(modo dev)"]

    SendEmail --> ClickLink["Usuário clica no link"]
    LogTerminal --> ClickLink
    ClickLink --> ResetPage["/reset-password?token=..."]
    ResetPage --> NewPassword["Define nova senha"]
    NewPassword --> ApiReset["POST /api/password/reset"]
    ApiReset --> ValidToken{"Token válido,<br/>não expirado,<br/>não usado?"}
    ValidToken -->|Não| TokenError["Erro: token inválido/expirado"]
    ValidToken -->|Sim| UpdatePassword["Atualiza senha (hash bcrypt)<br/>marca token como usado"]
    UpdatePassword --> Done(["Pode fazer login com a nova senha"])
```

---

## 5. Gerenciamento de Pedidos pelo Admin

```mermaid
flowchart TD
    AdminLogin(["Admin faz login em /admin/login"]) --> CheckRole{"token.isAdmin?"}
    CheckRole -->|Não| Unauthorized["Redireciona com erro:<br/>?error=unauthorized"]
    CheckRole -->|Sim| Dashboard["/admin — dashboard com métricas<br/>(total, confirmados, pendentes, receita)"]

    Dashboard --> GoOrders["Acessa 'Ver pedidos'"]
    GoOrders --> OrdersList["/admin/orders — lista todos os pedidos"]

    OrdersList --> SearchFilter["Busca por ID ou nome do prato<br/>+ filtro por status"]
    SearchFilter --> SelectOrder["Seleciona um pedido"]
    SelectOrder --> UpdateStatus["Atualiza status<br/>(AdminOrderCard)"]
    UpdateStatus --> ApiUpdate["PUT /api/admin/orders/:id"]
    ApiUpdate --> Reflect["Lista atualizada em tempo real<br/>(estado local otimista)"]
```
