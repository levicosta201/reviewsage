# Deployment

## Opção 1 — Docker Compose (self-hosted, recomendado)

A forma mais simples de rodar o ReviewSage em um servidor.

### Requisitos do servidor

- Ubuntu 22.04+ (ou qualquer Linux com Docker)
- 2 vCPUs, 2 GB RAM mínimo
- Docker 24+ com Docker Compose v2

### Passo a passo

```bash
# 1. Clonar o repositório no servidor
git clone https://github.com/reviewsage/reviewsage
cd reviewsage

# 2. Configurar variáveis de ambiente
cp .env.example .env
nano .env   # preencha todas as variáveis obrigatórias
```

**`.env` mínimo para produção:**
```env
DATABASE_URL="postgresql://reviewsage:SENHA_FORTE@postgres:5432/reviewsage"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="https://meu-dominio.com"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
ANTHROPIC_API_KEY="sk-ant-..."
REDIS_URL="redis://redis:6379"
NEXT_PUBLIC_APP_URL="https://meu-dominio.com"

# Senha do postgres (deve bater com DATABASE_URL)
POSTGRES_PASSWORD="SENHA_FORTE"
```

```bash
# 3. Build e subir
make build
make up

# 4. Verificar se está rodando
make logs-app
```

O app estará disponível na porta 3000. Use um reverse proxy (Nginx ou Caddy) para expor na porta 80/443.

---

### Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name meu-dominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name meu-dominio.com;

    ssl_certificate     /etc/letsencrypt/live/meu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meu-dominio.com/privkey.pem;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy como reverse proxy (mais simples)

```
meu-dominio.com {
    reverse_proxy localhost:3000
}
```

O Caddy gerencia TLS automaticamente via Let's Encrypt.

---

### Atualizando

```bash
git pull
make rebuild
make up
```

O `docker-entrypoint.sh` roda `prisma db push` automaticamente ao iniciar, aplicando novas migrations.

---

## Opção 2 — Vercel + banco externo

Adequado para quem prefere não gerenciar infraestrutura.

### Banco de dados

Você precisará de um PostgreSQL com pgvector hospedado externamente. Opções:

| Provedor | pgvector | Notas |
|---|---|---|
| [Supabase](https://supabase.com) | ✅ nativo | Free tier disponível |
| [Neon](https://neon.tech) | ✅ nativo | Serverless, free tier |
| [Railway](https://railway.app) | ✅ via plugin | Pay-as-you-go |
| [Render](https://render.com) | ✅ manual | Precisa rodar `CREATE EXTENSION vector` |

### Redis

| Provedor | Notas |
|---|---|
| [Upstash](https://upstash.com) | Serverless, free tier, TLS obrigatório |
| [Railway Redis](https://railway.app) | Simples de configurar |

### Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel
```

Configure as variáveis de ambiente no painel da Vercel (Settings → Environment Variables).

> **Atenção:** O sync de histórico usa background jobs que podem exceder o timeout de funções serverless (10-60s). Para repositórios grandes, prefira self-hosting ou mova o sync para uma fila separada (Vercel Cron + Upstash QStash).

---

## Opção 3 — Railway (tudo em um)

Railway permite subir o app + PostgreSQL + Redis na mesma plataforma.

1. Fork o repositório no GitHub
2. Crie um novo projeto no [Railway](https://railway.app)
3. Adicione os serviços:
   - **GitHub Repo** → aponte para seu fork
   - **PostgreSQL** → add plugin (pgvector já vem incluído)
   - **Redis** → add plugin
4. Configure as variáveis de ambiente no Railway
5. Deploy automático a cada push

---

## Checklist de produção

- [ ] `NEXTAUTH_SECRET` é único e gerado com `openssl rand -base64 32`
- [ ] `POSTGRES_PASSWORD` não é o padrão `reviewsage`
- [ ] GitHub OAuth App tem o callback URL correto (`https://dominio/api/auth/callback/github`)
- [ ] `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` apontam para o domínio com HTTPS
- [ ] Reverse proxy configurado com HTTPS
- [ ] Backups do PostgreSQL configurados (cron do `pg_dump` ou backup automático do provedor)
- [ ] `GITHUB_TOKEN` tem escopo mínimo necessário (`public_repo` ou `repo`)

---

## Variáveis de ambiente por ambiente

| Variável | Desenvolvimento | Produção |
|---|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://dominio.com` |
| `DATABASE_URL` | `postgresql://...@localhost:5432/reviewsage` | URL do provedor ou `@postgres:5432` (Docker) |
| `REDIS_URL` | `redis://localhost:6379` | URL do provedor ou `redis://redis:6379` (Docker) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://dominio.com` |
