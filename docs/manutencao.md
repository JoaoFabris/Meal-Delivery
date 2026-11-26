# Manual de Manutenção

Guia para a equipe técnica manter o FoodApp em funcionamento: atualizações, backups, logs, monitoramento e correção de erros.

Veja também: [`deploy.md`](./deploy.md) (publicação) e [`troubleshooting.md`](./troubleshooting.md) (problemas comuns).

---

## 1. Atualizações do sistema

### Fluxo de qualquer alteração

1. Criar branch a partir da `dev`: `feature/<nome>` ou `fix/<nome>`.
2. Desenvolver e escrever/atualizar testes.
3. `npm run lint` e `npm test -- --coverage` (cobertura mínima de 80%).
4. Abrir Pull Request → o CI (testes + build) precisa passar.
5. Merge em `dev` → validação no Preview Deployment da Vercel.
6. Merge em `main` → deploy de produção.

### Dependências

```bash
npm outdated              # lista pacotes desatualizados
npm update                # atualiza dentro das faixas do package.json
npm audit                 # vulnerabilidades conhecidas
npm audit fix             # corrige o que for seguro
```

- Atualize uma dependência importante por vez (Next.js, Prisma, NextAuth) e leia o changelog: essas bibliotecas costumam ter breaking changes.
- O projeto tem `package-lock.json` e `pnpm-lock.yaml`. Ao adicionar ou atualizar pacotes, atualize **os dois** (`npm install` e `pnpm install`), porque a Vercel pode instalar com pnpm.
- Rodar `npm audit` mensalmente.

### Alterações no banco (migrations)

```bash
# 1. Edite prisma/schema.prisma
# 2. Gere a migration em desenvolvimento
npx prisma migrate dev --name descricao_curta
# 3. Commit da pasta prisma/migrations
# 4. Em produção (feito pelo Job 3 do CI, ou manualmente):
npx prisma migrate deploy
```

Nunca edite uma migration que já foi aplicada em produção; crie uma nova.

---

## 2. Backups

| O quê                  | Como                                                                 | Frequência |
| ---------------------- | -------------------------------------------------------------------- | ---------- |
| Código                 | Git + GitHub (histórico completo, branches protegidas)              | A cada push |
| Banco (automático)     | Backup / restauração point-in-time do provedor gerenciado (Neon/Supabase) | Contínuo |
| Banco (manual)         | `pg_dump` (abaixo)                                                   | Semanal e antes de migrations |
| Variáveis de ambiente  | Cópia segura (gerenciador de senhas) das variáveis da Vercel         | A cada alteração |
| Artefatos de CI        | Relatório de cobertura (30 dias) e build (7 dias) no GitHub Actions  | A cada pipeline |

### Backup manual do banco

```bash
pg_dump "$DIRECT_URL" --format=custom --no-owner -f backup_$(date +%Y%m%d).dump
```

### Restauração

```bash
pg_restore --clean --no-owner -d "$DIRECT_URL" backup_AAAAMMDD.dump
```

> Teste a restauração periodicamente num banco separado: backup que nunca foi restaurado não é garantia.

---

## 3. Logs

| Onde                                  | O que mostra                                              |
| ------------------------------------- | --------------------------------------------------------- |
| **Vercel → Project → Logs**           | Logs das funções (rotas `app/api/*`), erros 500, `console.error` |
| **Vercel → Deployments → Build Logs** | Saída do `npm run build` de cada deploy                   |
| **GitHub → Actions**                  | Logs de testes, build e deploy de cada pipeline           |
| Terminal (`npm run dev`)              | Logs locais; sem `RESEND_API_KEY`, o link de reset de senha aparece aqui |

Todas as rotas da API passam pelo `errorHandler` central (`src/lib/middleware/errorHandler.ts`), que padroniza a resposta de erro e registra erros inesperados. Ao investigar um 500, procure o horário da requisição nos logs da Vercel.

---

## 4. Monitoramento

| O que monitorar             | Ferramenta                                                    |
| --------------------------- | ------------------------------------------------------------- |
| Disponibilidade do site     | Vercel (status dos deploys) + um monitor externo gratuito (ex.: UptimeRobot) apontando para a home |
| Erros e tempo de resposta das funções | Vercel → Observability                              |
| Uso do banco (conexões, armazenamento) | Painel do provedor do banco (Neon/Supabase)        |
| Saúde do pipeline           | Aba Actions (falhas notificadas por e-mail pelo GitHub)       |
| Dependências externas       | TheMealDB, Groq e Resend: se falharem, só a funcionalidade correspondente é afetada |
| Limites do plano gratuito   | Vercel → Usage; painel da Groq (rate limit do chat)           |

---

## 5. Correção de erros

1. **Reproduzir** — localmente (`npm run dev`) ou no Preview Deployment.
2. **Investigar** — logs da Vercel, aba Actions, [`troubleshooting.md`](./troubleshooting.md).
3. **Se produção estiver quebrada** — rollback imediato: Vercel → Deployments → último deploy estável → *Promote to Production*.
4. **Corrigir** — branch `fix/<nome>`, com um teste que reproduz o bug.
5. **Publicar** — PR → CI verde → merge na `main`.
6. **Registrar** — se for um problema recorrente, documente em `troubleshooting.md`.

---

## 6. Tarefas administrativas

| Tarefa                         | Como                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| Dar acesso admin a alguém      | Adicionar o e-mail em `ADMIN_EMAILS` (Vercel) e/ou mudar `role` para `ADMIN` na tabela `users` |
| Inspecionar dados              | `npx prisma studio` com a `DATABASE_URL` do ambiente desejado    |
| Trocar um segredo vazado       | Gerar novo valor, atualizar na Vercel, redeploy. Trocar `AUTH_SECRET`/`JWT_SECRET` desloga todos os usuários |
| Trocar senha da conta de demonstração | Alterar via fluxo "Esqueci minha senha" ou atualizar o hash no banco |

---

## 7. Rotina recomendada

| Frequência | Tarefa                                                         |
| ---------- | -------------------------------------------------------------- |
| Diária     | Conferir se o último pipeline está verde                       |
| Semanal    | Olhar logs de erro da Vercel; backup manual do banco           |
| Mensal     | `npm audit` / `npm outdated`; revisar uso do plano gratuito    |
| Semestral  | Testar restauração de backup; rotacionar `AUTH_SECRET` e `JWT_SECRET` |
