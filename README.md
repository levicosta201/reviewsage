# ReviewSage

> Code review com IA que aprende com o histórico do seu time. Economize 90% de tokens.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

## O que é o ReviewSage?

ReviewSage é uma plataforma SaaS open-source que:

1. **Lê o histórico de comentários de PRs** do seu repositório GitHub
2. **Cria um banco vetorial** com embeddings desses comentários
3. **Quando você solicita**, analisa um PR novo e gera comentários contextuais baseados nos padrões históricos
4. **Posta os comentários** diretamente no PR do GitHub

### Por que não review automático por push?

Ferramentas que rodam a cada push gastam tokens continuamente — mesmo em commits de WIP e fixups. Com o ReviewSage:

- O banco vetorial é construído **uma única vez** e atualizado incrementalmente
- O review **só roda quando você pede** — não em cada push
- Resultado: **90-94% de economia de tokens** com qualidade superior

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL + pgvector (embeddings vetoriais)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (GitHub OAuth + credenciais)
- **IA**: Anthropic Claude (review generation)
- **Queue**: BullMQ + Redis (sync de histórico)
- **UI**: Tailwind CSS + Radix UI

## Setup local

### Pré-requisitos

- Node.js 20+
- PostgreSQL com extensão `pgvector`
- Redis
- GitHub OAuth App
- Anthropic API key

### Instalação

```bash
git clone https://github.com/reviewsage/reviewsage
cd reviewsage
npm install

cp .env.example .env
# Preencha as variáveis no .env

npm run db:push
npm run dev
```

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reviewsage"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
ANTHROPIC_API_KEY=""
REDIS_URL="redis://localhost:6379"
```

### PostgreSQL com pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)/login|register/      # Autenticação
│   ├── (dashboard)/                # Painel do usuário
│   │   ├── dashboard/              # Visão geral
│   │   ├── projects/               # Gerenciar projetos
│   │   ├── review/                 # Revisar um PR
│   │   ├── history/                # Histórico de reviews
│   │   └── agent-skill/            # Exportar skill para agentes
│   ├── (admin)/admin/              # Painel super admin
│   └── api/                        # API Routes
│       ├── auth/                   # NextAuth + registro
│       ├── projects/               # CRUD de projetos
│       ├── reviews/                # Criar review
│       └── sync/[projectId]/       # Sincronizar histórico
├── lib/
│   ├── ai.ts                       # Claude + embeddings
│   ├── github.ts                   # Octokit wrapper
│   ├── db.ts                       # Prisma client
│   └── auth.ts                     # NextAuth config
└── components/ui/                  # Componentes UI base
```

## Agent Skill

O ReviewSage pode ser usado como uma skill em agentes de IA:

```json
POST /api/reviews
Authorization: Bearer sua-api-key
{
  "prUrl": "https://github.com/owner/repo/pull/123"
}
```

Ideal para usar com Claude Code, Cursor, ou qualquer agente que suporte MCP.

## Multi-tenant

Cada empresa tem seu próprio workspace isolado com:
- Projetos e histórico separados
- Controle de acesso por role (Owner, Admin, Member)
- Métricas de uso individuais
- Planos Free / Pro / Enterprise

## Contribuindo

PRs são bem-vindos! Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT © ReviewSage Contributors
