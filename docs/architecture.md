# Arquitetura

## Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  Landing Page │ Dashboard │ /review │ /projects │ /admin    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js 16 (App Router)                   │
│                                                             │
│  Server Components    │  API Routes         │  Middleware   │
│  (RSC — sem JS)       │  /api/*             │  (auth guard) │
└──────────┬────────────┴──────┬──────────────┴───────────────┘
           │                   │
    ┌──────▼──────┐    ┌───────▼────────────────────────┐
    │   Prisma    │    │         Serviços externos        │
    │    ORM      │    │                                 │
    └──────┬──────┘    │  GitHub API (Octokit)           │
           │           │  Anthropic Claude Haiku          │
    ┌──────▼──────┐    └─────────────────────────────────┘
    │ PostgreSQL  │
    │  + pgvector │
    └─────────────┘
    ┌─────────────┐
    │    Redis    │  ← BullMQ (sync em background)
    └─────────────┘
```

---

## Multi-tenancy

Cada empresa (Organization) tem dados completamente isolados. A hierarquia é:

```
Organization
 ├── OrganizationUser (role: OWNER | ADMIN | MEMBER)
 ├── Project (1 org → N projetos)
 │    ├── PRCommentEmbedding (histórico vetorial)
 │    └── ReviewSession (cada review realizado)
 │         └── ReviewComment (comentários gerados)
 └── ApiKey
```

O isolamento é garantido no banco: toda query filtra por `organizationId`. Não existe compartilhamento de dados entre organizations.

---

## Fluxo de sincronização de histórico

```
POST /api/sync/:projectId
         │
         ▼
  Marca projeto como SYNCING
         │
         ▼ (background)
  GitHub API → lista PRs fechados
         │
         ▼ (para cada PR)
  GitHub API → comentários de review
               (inline + gerais)
         │
         ▼ (para cada comentário)
  generateEmbedding(text)
  → vetor float[1536]
         │
         ▼
  INSERT INTO "PRCommentEmbedding"
  (embedding::vector)
         │
         ▼
  Atualiza projeto:
  syncStatus=COMPLETED, commentCount++
```

> **Nota:** A função `generateEmbedding` em `src/lib/ai.ts` usa um placeholder aleatório por enquanto. Para produção, substitua por uma API de embeddings real (Voyage AI via Anthropic, OpenAI embeddings, etc.).

---

## Fluxo de review de PR

```
POST /api/reviews
  { prUrl, projectId? }
         │
         ▼
  Parseia URL → owner/repo/number
         │
         ▼
  Busca ou cria projeto
         │
         ▼
  Cria ReviewSession (status=PROCESSING)
         │
         ├─ GitHub API: fetchPRDiff()
         │   → title, description, diff (patch por arquivo)
         │
         ├─ generateEmbedding(diff[:8000])
         │   → vetor float[1536]
         │
         ├─ findSimilarComments(projectId, embedding, limit=12)
         │   → cosine similarity via pgvector (<=>)
         │   → top-12 comentários históricos mais parecidos
         │
         ├─ generatePRReview(diff, similarComments, projectContext)
         │   → Claude Haiku (system prompt + user prompt)
         │   → retorna JSON: [{filePath, lineNumber, body, severity}]
         │
         ├─ postReviewComments() via GitHub API
         │   → inline comments (com filePath+line) ou issue comments
         │
         ├─ db.reviewComment.createMany()
         │
         └─ ReviewSession: status=COMPLETED, tokensUsed, commentsPosted
```

---

## Prompt de review

O prompt enviado ao Claude Haiku tem dois componentes:

**System prompt** — define o papel e o formato de saída:
```
You are an expert code reviewer. Return a JSON array:
[{ "filePath": "...", "lineNumber": N, "body": "...", "severity": "WARNING" }]
```

**User prompt** — contexto específico do PR:
```
Project: {nome do projeto}
PR Title: {título}
PR Description: {descrição}

Historical review patterns (top 8 similares por cosine similarity):
- [src/auth/middleware.ts] Token JWT não está sendo verificado...
- [src/api/users.ts] SQL injection via concatenação...
...

Diff to review:
```diff
--- a/src/auth/middleware.ts
+++ b/src/auth/middleware.ts
...
```
```

O limite do diff é 12.000 caracteres para caber dentro do contexto do Haiku.

---

## Schema do banco de dados

### Tabelas principais

#### `Organization`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | cuid | PK |
| `name` | String | Nome da empresa |
| `slug` | String (unique) | Identificador na URL |
| `plan` | Enum | FREE \| PRO \| ENTERPRISE |

#### `Project`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | cuid | PK |
| `organizationId` | String | FK → Organization |
| `githubOwner` | String | Login/org do GitHub |
| `githubRepo` | String | Nome do repositório |
| `githubToken` | String? | PAT (criptografado) para repos privados |
| `syncStatus` | Enum | IDLE \| SYNCING \| COMPLETED \| FAILED |
| `commentCount` | Int | Total de embeddings indexados |

#### `PRCommentEmbedding`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | cuid | PK |
| `projectId` | String | FK → Project |
| `prNumber` | Int | Número do PR de origem |
| `commentBody` | Text | Texto do comentário |
| `commentType` | String | `inline` ou `general` |
| `filePath` | String? | Arquivo comentado (se inline) |
| `lineNumber` | Int? | Linha comentada |
| `embedding` | vector(1536) | Vetor gerado pelo modelo de embeddings |

> O tipo `vector(1536)` é da extensão `pgvector`. A busca usa o operador `<=>` (cosine distance).

#### `ReviewSession`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | cuid | PK |
| `organizationId` | String | FK → Organization |
| `projectId` | String | FK → Project |
| `prUrl` | String | URL completa do PR |
| `prNumber` | Int | Número do PR |
| `status` | Enum | PENDING \| PROCESSING \| COMPLETED \| FAILED |
| `tokensUsed` | Int? | Estimativa de tokens consumidos |
| `commentsPosted` | Int? | Quantidade de comentários postados |

#### `ReviewComment`
| Coluna | Tipo | Descrição |
|---|---|---|
| `reviewSessionId` | String | FK → ReviewSession |
| `filePath` | String? | Arquivo comentado |
| `lineNumber` | Int? | Linha comentada |
| `body` | Text | Texto do comentário gerado |
| `severity` | Enum | CRITICAL \| WARNING \| SUGGESTION \| INFO |
| `githubCommentId` | Int? | ID do comentário criado no GitHub |

---

## Estrutura de arquivos

```
reviewsage/
├── docs/                          # Esta documentação
├── prisma/
│   └── schema.prisma              # Schema completo do banco
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page (público)
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # CSS global + variáveis de tema
│   │   │
│   │   ├── (auth)/                # Rotas de autenticação (sem sidebar)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/           # Painel do usuário (com sidebar)
│   │   │   ├── layout.tsx         # Sidebar + proteção de rota
│   │   │   ├── dashboard/         # Visão geral e stats
│   │   │   ├── projects/          # Gerenciar repositórios
│   │   │   ├── review/            # Revisar um PR
│   │   │   ├── history/           # Histórico de reviews
│   │   │   └── agent-skill/       # Exportar skill para agentes
│   │   │
│   │   ├── (admin)/               # Painel super admin
│   │   │   └── admin/
│   │   │       ├── layout.tsx     # Sidebar admin + guard (role=ADMIN)
│   │   │       ├── page.tsx       # Métricas globais
│   │   │       └── companies/     # Listagem de organizations
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/ # Handler NextAuth
│   │       │   └── register/      # Criação de conta + organization
│   │       ├── projects/          # GET + POST de projetos
│   │       ├── reviews/           # POST: processa um PR
│   │       └── sync/[projectId]/  # POST: dispara sync de histórico
│   │
│   ├── components/ui/             # Componentes base (Button, Badge, etc.)
│   ├── lib/
│   │   ├── ai.ts                  # Embeddings + busca vetorial + review
│   │   ├── auth.ts                # Config NextAuth (providers, callbacks)
│   │   ├── db.ts                  # Singleton do Prisma Client
│   │   ├── github.ts              # Octokit: fetch diff, post comments
│   │   └── utils.ts               # cn(), slugify(), formatNumber()
│   └── types/
│       └── next-auth.d.ts         # Extensão de tipos da sessão
│
├── Dockerfile                     # Multi-stage build (produção)
├── docker-compose.yml             # Stack completa
├── docker-compose.dev.yml         # Só infra (dev local)
├── docker-entrypoint.sh           # Aguarda DB + roda db push
└── Makefile                       # Atalhos de desenvolvimento
```

---

## Decisões de design

### Por que Next.js App Router com Server Components?

O dashboard lê dados do banco diretamente nos Server Components (sem fetch intermediário), reduzindo latência e eliminando endpoints desnecessários. Apenas páginas com interatividade usam `"use client"`.

### Por que pgvector em vez de um banco vetorial dedicado (Pinecone, Qdrant)?

Mantém a stack simples (um único banco) e o PostgreSQL já tem transações, cascades e indexação que seriam duplicadas em um serviço separado. Para volumes até ~10M embeddings, pgvector tem performance adequada.

### Por que Claude Haiku para geração de reviews?

Haiku tem latência baixa (~5-10s por review) e custo reduzido, adequado para uso on-demand. O contexto histórico via RAG compensa a diferença de capacidade em relação a modelos maiores.

### Por que o review é síncrono (não em fila)?

O endpoint `/api/reviews` é síncrono para dar feedback imediato na UI. O sync de histórico (`/api/sync`) é assíncrono por ser um processo longo. Reviews futuros podem ser movidos para fila se a latência do Haiku se tornar um problema.
