# Getting Started

## Pré-requisitos

| Requisito | Versão mínima | Notas |
|---|---|---|
| Node.js | 20 | Recomendado via [nvm](https://github.com/nvm-sh/nvm) |
| Docker | 24 | Para postgres + redis |
| Docker Compose | v2 | Incluído no Docker Desktop |
| Conta GitHub | — | Para criar o OAuth App |
| Anthropic API key | — | Para geração de reviews |

---

## Opção A — Setup com Make (recomendado)

```bash
git clone https://github.com/reviewsage/reviewsage
cd reviewsage

make setup
```

O comando `make setup` faz tudo de uma vez:
1. Copia `.env.example` → `.env`
2. Roda `npm install`
3. Sobe PostgreSQL + Redis via Docker
4. Aplica o schema (`prisma db push`)

Depois edite o `.env` com suas chaves (veja [Configuração](configuration.md)) e rode:

```bash
make dev
```

O app estará disponível em `http://localhost:3000`.

---

## Opção B — Setup manual

```bash
# 1. Clonar
git clone https://github.com/reviewsage/reviewsage
cd reviewsage

# 2. Instalar dependências
npm install

# 3. Criar .env
cp .env.example .env
# Edite .env com suas variáveis (veja docs/configuration.md)

# 4. Subir infra
docker compose -f docker-compose.dev.yml up -d

# 5. Aplicar schema (cria tabelas + extensão pgvector)
npm run db:push

# 6. Iniciar dev server
npm run dev
```

---

## Criando o GitHub OAuth App

O ReviewSage usa GitHub OAuth para autenticação e para acessar repositórios.

1. Acesse **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Preencha:
   - **Application name:** ReviewSage (ou qualquer nome)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Clique em **Register application**
4. Copie o **Client ID** e gere um **Client Secret**
5. Adicione no `.env`:
   ```env
   GITHUB_CLIENT_ID="seu-client-id"
   GITHUB_CLIENT_SECRET="seu-client-secret"
   ```

> Em produção troque as URLs para seu domínio real.

---

## Primeiro uso

### 1. Criar conta

Acesse `http://localhost:3000/register` e crie uma conta. Você pode usar GitHub OAuth ou email + senha.

Ao registrar, uma **Organization** é criada automaticamente com você como Owner.

### 2. Adicionar um projeto

Acesse `/projects` → **Adicionar projeto**:

- **Nome:** nome amigável (ex: "API Core")
- **GitHub Owner:** dono do repositório (usuário ou org)
- **GitHub Repo:** nome do repositório
- **GitHub Token:** Personal Access Token com scope `repo` (necessário para repositórios privados)

### 3. Sincronizar o histórico

Clique em **Sincronizar histórico** no card do projeto. O ReviewSage vai:

1. Buscar todos os PRs fechados via GitHub API
2. Ler os comentários de review (inline + gerais)
3. Gerar embeddings vetoriais para cada comentário
4. Armazenar no PostgreSQL com pgvector

O processo roda em background. O status muda para `COMPLETED` quando finalizar.

> O tempo varia conforme o volume de PRs. Repositórios com centenas de PRs podem levar alguns minutos.

### 4. Revisar um PR

Acesse `/review`, cole a URL de um PR aberto e clique em **Revisar PR**:

```
https://github.com/minha-org/meu-repo/pull/123
```

O ReviewSage vai:
1. Buscar o diff do PR via GitHub API
2. Gerar embedding do diff e buscar comentários similares no histórico
3. Enviar o diff + padrões históricos para o Claude Haiku
4. Postar os comentários gerados diretamente no PR
5. Retornar um resumo com severidade de cada comentário

---

## Comandos Make disponíveis

```bash
make help         # Lista todos os comandos

make setup        # Configura do zero (primeira vez)
make dev          # Sobe infra + inicia Next.js em modo dev

make up           # Stack completa em Docker (produção)
make down         # Para toda a stack
make build        # Builda imagem Docker do app
make rebuild      # Build sem cache

make logs         # Logs de todos os serviços
make logs-app     # Logs só do app
make shell        # Shell no container (produção)

make db-push      # Aplica schema Prisma (sem migration)
make db-migrate   # Cria e aplica migration
make db-studio    # Abre Prisma Studio no browser
make db-reset     # Apaga e recria o banco de dev

make lint         # ESLint
make typecheck    # TypeScript type check

make nuke         # Remove tudo (containers, volumes, build, deps)
```

---

## Próximos passos

- [Configuração completa de variáveis](configuration.md)
- [Como funciona por dentro](architecture.md)
- [Deploy em produção](deployment.md)
- [Usar como Agent Skill](agent-skill.md)
