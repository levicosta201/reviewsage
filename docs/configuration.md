# Configuração

Todas as variáveis de ambiente ficam no arquivo `.env` (gerado a partir de `.env.example`).

---

## Variáveis obrigatórias

### `DATABASE_URL`

String de conexão com o PostgreSQL. O banco precisa ter a extensão `pgvector` instalada.

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/reviewsage"
```

Com Docker (`make dev`), use:
```env
DATABASE_URL="postgresql://reviewsage:reviewsage@localhost:5432/reviewsage"
```

Em produção com docker-compose completo, o app se conecta pelo hostname interno:
```env
DATABASE_URL="postgresql://reviewsage:reviewsage@postgres:5432/reviewsage"
```

> O docker-compose sobrescreve automaticamente `DATABASE_URL` para o hostname interno — você não precisa mudar nada para produção.

---

### `NEXTAUTH_SECRET`

String aleatória usada para assinar os JWTs de sessão. Gere com:

```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcd"
```

> Nunca reutilize este valor entre ambientes. Um vazamento compromete todas as sessões.

---

### `NEXTAUTH_URL`

URL base da aplicação. Usada pelo NextAuth para construir as URLs de callback OAuth.

```env
# Desenvolvimento
NEXTAUTH_URL="http://localhost:3000"

# Produção
NEXTAUTH_URL="https://meu-dominio.com"
```

---

### `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`

Credenciais do GitHub OAuth App. Veja como criar em [Getting Started → Criando o GitHub OAuth App](getting-started.md#criando-o-github-oauth-app).

```env
GITHUB_CLIENT_ID="Iv1.abc123def456"
GITHUB_CLIENT_SECRET="abc123def456abc123def456abc123def456abc1"
```

---

### `ANTHROPIC_API_KEY`

Chave da API da Anthropic. Usada para gerar reviews via Claude Haiku.

```env
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

Obtenha em: [console.anthropic.com](https://console.anthropic.com)

---

### `REDIS_URL`

URL do Redis, usada pelo BullMQ para filas de jobs (sync de histórico em background).

```env
# Local
REDIS_URL="redis://localhost:6379"

# Com autenticação
REDIS_URL="redis://:senha@host:6379"

# Com TLS (ex: Upstash)
REDIS_URL="rediss://default:senha@host:6380"
```

---

## Variáveis opcionais

### `NEXT_PUBLIC_APP_URL`

URL pública da aplicação. Usada para gerar links absolutos (ex: na página Agent Skill).

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### `NEXT_PUBLIC_APP_NAME`

Nome exibido na interface. Útil para white-label.

```env
NEXT_PUBLIC_APP_NAME="ReviewSage"
```

### `GITHUB_TOKEN`

Personal Access Token do GitHub usado como fallback quando um projeto não tem token próprio configurado.

```env
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
```

Escopos necessários: `repo` (para repositórios privados) ou `public_repo` (apenas públicos).

---

## Variáveis do docker-compose

O `docker-compose.yml` usa estas variáveis adicionais com valores padrão:

```env
# Porta exposta do app (padrão: 3000)
APP_PORT=3000

# Configurações do PostgreSQL (padrão: reviewsage/reviewsage/reviewsage)
POSTGRES_USER=reviewsage
POSTGRES_PASSWORD=reviewsage
POSTGRES_DB=reviewsage
POSTGRES_PORT=5432

# Porta exposta do Redis (padrão: 6379)
REDIS_PORT=6379
```

Você pode colocar essas variáveis no `.env` e o docker-compose as lerá automaticamente.

---

## Configurando o GitHub OAuth para produção

Ao fazer deploy em produção, o callback URL precisa ser atualizado.

1. Acesse seu OAuth App em **GitHub Settings → Developer Settings → OAuth Apps**
2. Edite a **Authorization callback URL**:
   ```
   https://meu-dominio.com/api/auth/callback/github
   ```
3. Atualize o `.env` de produção:
   ```env
   NEXTAUTH_URL="https://meu-dominio.com"
   ```

> Para testar localmente e em produção simultaneamente, crie dois OAuth Apps separados — um para `localhost:3000` e um para o domínio de produção.

---

## Referência rápida

```env
# ─── Obrigatórias ─────────────────────────────────
DATABASE_URL="postgresql://reviewsage:reviewsage@localhost:5432/reviewsage"
NEXTAUTH_SECRET=""           # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
ANTHROPIC_API_KEY=""
REDIS_URL="redis://localhost:6379"

# ─── Opcionais ────────────────────────────────────
GITHUB_TOKEN=""              # fallback para repos sem token próprio
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ReviewSage"
```
