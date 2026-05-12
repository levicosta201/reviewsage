<div align="center">

<br/>

```
██████╗ ███████╗██╗   ██╗██╗███████╗██╗    ██╗███████╗ █████╗  ██████╗ ███████╗
██╔══██╗██╔════╝██║   ██║██║██╔════╝██║    ██║██╔════╝██╔══██╗██╔════╝ ██╔════╝
██████╔╝█████╗  ██║   ██║██║█████╗  ██║ █╗ ██║███████╗███████║██║  ███╗█████╗  
██╔══██╗██╔══╝  ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║╚════██║██╔══██║██║   ██║██╔══╝  
██║  ██║███████╗ ╚████╔╝ ██║███████╗╚███╔███╔╝███████║██║  ██║╚██████╔╝███████╗
╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**AI-powered code review that learns from your team's history.**  
Review PRs on demand — not on every push. Save up to 94% on AI tokens.

<br/>

[![License: MIT](https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169e1?style=flat-square&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Claude](https://img.shields.io/badge/Anthropic-Claude_Haiku-d97706?style=flat-square)](https://anthropic.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-34d399?style=flat-square)](CONTRIBUTING.md)

<br/>

[**Quick Start**](#-quick-start) · [**How It Works**](#-how-it-works) · [**Docs**](docs/index.md) · [**Contributing**](CONTRIBUTING.md)

<br/>

</div>

---

## The problem with on-push AI review

Most AI code review tools run on **every single push** — including WIP commits, fixups, rebases, and whitespace tweaks. That means paying for AI tokens you don't need.

```
On-push review  →  8 pushes/day × ~2,000 tokens  =  352,000 tokens/month  (~$11/dev)
ReviewSage      →  3 reviews/day × ~1,200 tokens  =   79,200 tokens/month  (~$0.60/dev)
                                                              ↑
                                                      94% less spend
```

ReviewSage builds a **persistent vector database** from your historical PR comments — once. When you ask for a review, it searches that history for similar patterns and generates contextual, actionable feedback using Claude Haiku.

The result: **better reviews** (grounded in your team's real standards) **at a fraction of the cost**.

---

## ✨ Features

- **Vector memory** — indexes all historical PR comments as embeddings; learns your team's patterns
- **On-demand reviews** — paste a PR URL, get comments posted directly to GitHub in seconds
- **Multi-tenant** — isolated workspaces per company, role-based access (Owner / Admin / Member)
- **Agent skill** — export as a callable skill for Claude Code, MCP, or any tool-use agent
- **Admin panel** — global metrics, company management, usage tracking
- **Self-hostable** — one `docker compose up` and you're running
- **Open source** — MIT license, no telemetry, no lock-in

---

## 🚀 Quick Start

**Prerequisites:** Node.js 20+, Docker, GitHub OAuth App, Anthropic API key.

```bash
git clone https://github.com/levicosta201/reviewsage
cd reviewsage

make setup   # copies .env, installs deps, starts postgres+redis, pushes schema
```

Edit `.env` with your keys (see [Configuration docs](docs/configuration.md)), then:

```bash
make dev     # starts Next.js at http://localhost:3000
```

That's it. See the full [Getting Started guide](docs/getting-started.md) for OAuth App setup and first review walkthrough.

---

## 🔍 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  SETUP (once per repo)                                          │
│                                                                 │
│  GitHub API ──► historical PR comments ──► embeddings          │
│                                               │                 │
│                                          pgvector DB            │
└───────────────────────────────────────────────┬─────────────────┘
                                                │  persists
┌───────────────────────────────────────────────▼─────────────────┐
│  ON REVIEW REQUEST                                              │
│                                                                 │
│  PR URL ──► fetch diff ──► embed diff ──► vector search        │
│                                               │                 │
│                                         top-12 similar          │
│                                         past comments           │
│                                               │                 │
│                                        Claude Haiku             │
│                                     (diff + history)            │
│                                               │                 │
│                                    post to GitHub PR ◄──────────┘
└─────────────────────────────────────────────────────────────────┘
```

### Review output example

```
┌─ src/auth/middleware.ts:42 ─────────────────── WARNING ─┐
│ JWT token is used before verification. This pattern was │
│ flagged in 12 previous PRs on this repo.                │
└─────────────────────────────────────────────────────────┘

┌─ src/api/users.ts:87 ──────────────────────── CRITICAL ─┐
│ SQL query built via string concatenation — SQL injection │
│ vulnerability. Use parameterized queries.                │
└──────────────────────────────────────────────────────────┘

┌─ src/utils/cache.ts:23 ───────────────────── SUGGESTION ─┐
│ Cache key may collide in multi-tenant scenarios.          │
│ Prefix with tenant ID.                                    │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, Server Components, API Routes |
| Language | [TypeScript 5](https://typescriptlang.org) |
| Database | [PostgreSQL 16](https://postgresql.org) + [pgvector](https://github.com/pgvector/pgvector) |
| ORM | [Prisma](https://prisma.io) |
| Auth | [NextAuth.js v5](https://authjs.dev) — GitHub OAuth + credentials |
| AI | [Anthropic Claude Haiku](https://anthropic.com) — review generation |
| Queue | [BullMQ](https://bullmq.io) + Redis — background history sync |
| UI | [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://radix-ui.com) |
| Infra | Docker, docker-compose, Make |

---

## 🐳 Docker

Full production stack (app + postgres + redis) in one command:

```bash
cp .env.example .env   # fill in your keys
make up                # docker compose up -d
```

Or for local development with hot-reload (Next.js runs natively, only infra in Docker):

```bash
make dev               # starts postgres+redis in Docker, Next.js locally
```

See [Deployment docs](docs/deployment.md) for Nginx/Caddy setup, Vercel, and Railway options.

---

## 🤖 Agent Skill

Use ReviewSage as a tool in any AI agent:

```bash
curl -X POST https://your-instance.com/api/reviews \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prUrl": "https://github.com/org/repo/pull/123"}'
```

```json
{
  "prTitle": "feat: add rate limiting",
  "prNumber": 123,
  "commentsPosted": 4,
  "tokensUsed": 1180,
  "comments": [...]
}
```

For Claude Code, add to your `CLAUDE.md`:

````markdown
When asked to review a PR, call:
```bash
curl -X POST https://your-instance.com/api/reviews \
  -d '{"prUrl": "<PR_URL>"}'
```
````

MCP server support is on the roadmap. See [Agent Skill docs](docs/agent-skill.md).

---

## 📖 Documentation

| Guide | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Setup, OAuth App, first review |
| [Architecture](docs/architecture.md) | System design, data flow, DB schema |
| [Configuration](docs/configuration.md) | All environment variables |
| [API Reference](docs/api-reference.md) | REST endpoints with examples |
| [Deployment](docs/deployment.md) | Docker, self-hosted, Vercel, Railway |
| [Agent Skill](docs/agent-skill.md) | Using ReviewSage inside AI agents |

---

## 🗺 Roadmap

- [ ] MCP server for Claude Code integration
- [ ] Real embedding model (Voyage AI / OpenAI)
- [ ] GitLab support
- [ ] Webhook trigger (review when PR is opened — optional, per-project toggle)
- [ ] Review quality feedback loop (thumbs up/down on comments)
- [ ] Slack / Teams notifications
- [ ] Billing integration (Stripe)

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement.

```bash
# Fork → clone → create branch
git checkout -b feat/my-feature

# Make changes, then
make typecheck   # TypeScript check
make lint        # ESLint

# Commit and open a PR
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, including how to run the dev environment and the commit message convention.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for teams that care about code quality without burning through AI budgets.

**Star ⭐ the repo if ReviewSage saves you tokens!**

</div>
