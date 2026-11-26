# Manual do Administrador

Este manual explica como usar o painel administrativo do FoodApp — a área restrita a usuários com papel `ADMIN`.

---

## 1. Acessando o painel admin

1. Acesse `/admin/login` (link também disponível na tela de login normal, em "É administrador? Acesse o painel admin").
2. Entre com uma conta cujo e-mail esteja em `ADMIN_EMAILS`. Pela página `/admin/login` o acesso é por Google ou GitHub; contas de e-mail/senha (como a `admin@foodapp.com` do seed) entram pelo `/login` normal e depois acessam `/admin`.
3. Se sua conta não tiver permissão de admin, você será redirecionado de volta com uma mensagem de acesso não autorizado.

<!-- screenshot: tela de login admin -->

> **Como uma conta vira admin?** O acesso ao painel é liberado pela variável de ambiente `ADMIN_EMAILS` (lista de e-mails separados por vírgula), lida em `src/lib/auth.ts` e gravada no token de sessão como `isAdmin`. Para dar acesso a alguém, adicione o e-mail em `ADMIN_EMAILS` (no `.env` local ou em Vercel → Settings → Environment Variables), faça redeploy e peça para a pessoa sair e entrar de novo. O campo `role` da tabela `users` é preenchido pelo seed, mas não é o que libera o painel.

---

## 2. Dashboard

Ao entrar, você cai no dashboard (`/admin`), com um resumo geral:

- **Total de pedidos**
- **Pedidos confirmados**
- **Pedidos pendentes**
- **Pedidos entregues**
- **Receita total acumulada** (soma de todos os pedidos)

<!-- screenshot: dashboard admin com cards de métricas -->

Esses números são calculados em tempo real a partir de todos os pedidos existentes no momento em que a página é carregada.

---

## 3. Gerenciando pedidos

1. No dashboard, clique em **Ver pedidos** (ou acesse `/admin/orders` diretamente).
2. Você verá a lista completa de pedidos de todos os usuários.

<!-- screenshot: lista de pedidos no admin -->

### Buscando e filtrando

- **Busca por texto**: digite parte do ID do pedido ou o nome de um prato no campo de busca.
- **Filtro por status**: clique em um dos botões (Todos, Pendente, Confirmado, Entregue, Cancelado) para ver só pedidos naquele estado.
- Busca e filtro funcionam juntos — você pode buscar dentro de um status específico.

### Atualizando o status de um pedido

1. Localize o pedido na lista.
2. Use o controle de status no card do pedido para avançar o pedido pelo fluxo:

   `Pendente → Confirmado → Preparando → Entregue`

   (ou marcar como `Cancelado` a partir de qualquer estado anterior a "Entregue")

3. A mudança é refletida imediatamente na tela — não é preciso recarregar a página.

<!-- screenshot: card de pedido com opções de status -->

> **Atenção:** o sistema não impede tecnicamente "pular" etapas (ex: ir direto de Pendente para Entregue) — a disciplina de seguir a ordem correta do fluxo é uma prática operacional, não uma trava do sistema.

---

## 4. Boas práticas para o dia a dia

- Atualize o status assim que o pedido mudar de etapa real (confirmação, início do preparo, saída para entrega) — os clientes acompanham esse status na própria conta deles.
- Use a busca por nome de prato para identificar rapidamente pedidos com um item específico (útil em picos de demanda de um prato popular).
- Cancelamentos devem ser feitos assim que identificados — um pedido cancelado não pode voltar a um status ativo.

---

## Problemas comuns

Para erros ou comportamentos inesperados, consulte o [Guia de Solução de Problemas](./troubleshooting.md).
