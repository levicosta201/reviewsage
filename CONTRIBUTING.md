# Contributing to ReviewSage

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Convention](#commit-convention)
- [Opening a Pull Request](#opening-a-pull-request)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be respectful. Constructive criticism is welcome; personal attacks are not. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Development Setup

### Prerequisites

- Node.js 20+
- Docker + Docker Compose v2
- A GitHub account (for OAuth App)
- An Anthropic API key

### First-time setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/reviewsage
cd reviewsage

# 2. Install dependencies and start infrastructure
make setup

# 3. Fill in your credentials
nano .env   # see docs/configuration.md for each variable

# 4. Start the dev server
make dev
```

The app runs at `http://localhost:3000` with hot-reload.

### Useful commands

```bash
make dev          # start postgres+redis (Docker) + Next.js (local)
make typecheck    # TypeScript check — run before committing
make lint         # ESLint
make db-studio    # open Prisma Studio to inspect data
make db-reset     # wipe dev database and re-apply schema
make infra-down   # stop postgres+redis
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Public landing page
│   ├── (auth)/                   # Login, register
│   ├── (dashboard)/              # Authenticated user panel
│   │   ├── dashboard/            # Overview + stats
│   │   ├── projects/             # Manage GitHub repos
│   │   ├── review/               # Review a PR
│   │   ├── history/              # Review history
│   │   └── agent-skill/          # Export agent skill
│   ├── (admin)/admin/            # Super-admin panel
│   └── api/                      # API routes
├── components/ui/                # Base UI components
├── lib/
│   ├── ai.ts                     # Embeddings + Claude review generation
│   ├── github.ts                 # Octokit wrapper
│   ├── auth.ts                   # NextAuth config
│   └── db.ts                     # Prisma singleton
└── types/
    └── next-auth.d.ts            # Session type augmentation
```

See [Architecture docs](docs/architecture.md) for a deeper dive.

---

## Making Changes

### Bug fixes

1. Open an issue first (or comment on an existing one) so we can discuss the fix
2. Create a branch: `fix/short-description`
3. Write the fix
4. Run `make typecheck` and `make lint`
5. Open a PR referencing the issue

### New features

1. Open an issue or Discussion with your proposal before writing code
2. Wait for a maintainer to approve the direction
3. Create a branch: `feat/short-description`
4. Implement the feature
5. Update documentation in `docs/` if needed
6. Open a PR

### Documentation

Docs live in `docs/`. Each file maps to a topic. PRs that improve clarity, fix typos, or add missing information are always welcome — no issue needed.

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Build, deps, config |
| `refactor` | Code change that is neither fix nor feature |
| `test` | Tests |
| `perf` | Performance improvement |

**Examples:**

```
feat: add GitLab PR support
fix: handle missing github token gracefully
docs: add MCP integration example to agent-skill.md
chore: upgrade prisma to 6.9
```

Keep the subject line under 72 characters. Use the body to explain *why*, not *what*.

---

## Opening a Pull Request

1. Make sure `make typecheck` and `make lint` pass
2. Keep PRs focused — one logical change per PR
3. Fill in the PR template:
   - What changed and why
   - How to test it
   - Screenshots for UI changes
4. Link to the related issue with `Closes #123`

A maintainer will review within a few days. We may request changes or ask clarifying questions.

---

## Reporting Issues

Use the GitHub Issues tab. Include:

- **Description** — what went wrong
- **Steps to reproduce** — minimal steps to trigger the bug
- **Expected vs actual behavior**
- **Environment** — OS, Node version, Docker version
- **Logs** — relevant error messages (`make logs-app`)

For security vulnerabilities, **do not open a public issue**. Email the maintainer directly.

---

## Questions?

Open a [Discussion](https://github.com/levicosta201/reviewsage/discussions) for questions that aren't bugs or feature requests.
