# ReviewSage — Documentação

> Code review com IA que aprende com o histórico do seu time.

## Índice

| Documento | Descrição |
|---|---|
| [Getting Started](getting-started.md) | Setup do zero, primeira configuração e primeiro review |
| [Arquitetura](architecture.md) | Design do sistema, fluxo de dados, schema do banco |
| [Configuração](configuration.md) | Todas as variáveis de ambiente e integrações |
| [API Reference](api-reference.md) | Todos os endpoints REST com exemplos |
| [Deployment](deployment.md) | Docker, self-hosted, Vercel |
| [Agent Skill](agent-skill.md) | Como usar o ReviewSage como skill em agentes de IA |

## O que é o ReviewSage?

ReviewSage é uma plataforma SaaS **open-source** (MIT) que automatiza code reviews usando IA com memória histórica.

### Como funciona em 4 passos

```
1. Conectar repo GitHub
        ↓
2. Sincronizar histórico de PRs
   (comentários → embeddings vetoriais → pgvector)
        ↓
3. Colar URL de um PR novo
        ↓
4. IA busca padrões similares no histórico
   → gera comentários → posta no GitHub
```

### Por que "sob demanda"?

Ferramentas de review por push gastam tokens em **cada commit** — incluindo WIPs, fixups e rebases. O ReviewSage só processa quando você pede, com o banco vetorial já construído.

```
Review on-push   →  ~352.000 tokens/dev/mês  (~$11)
ReviewSage       →  ~79.200  tokens/dev/mês  (~$0.60)
                              ↑
                         94% de economia
```

## Stack

- **Next.js 16** (App Router) — framework full-stack
- **PostgreSQL 16 + pgvector** — banco relacional + busca vetorial
- **Prisma** — ORM e migrations
- **NextAuth.js v5** — autenticação (GitHub OAuth + credenciais)
- **Anthropic Claude Haiku** — geração de reviews
- **BullMQ + Redis** — filas de jobs para sync em background
- **Tailwind CSS + Radix UI** — componentes de interface
