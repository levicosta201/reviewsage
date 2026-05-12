# API Reference

Todas as rotas da API ficam em `/api/*`. A autenticação é via sessão NextAuth (cookie) para uso pela interface, ou via header `Authorization: Bearer <api-key>` para uso programático.

---

## Autenticação

### `POST /api/auth/register`

Cria um novo usuário e uma nova Organization.

**Body**
```json
{
  "name": "João Silva",
  "orgName": "Minha Empresa",
  "email": "joao@empresa.com",
  "password": "minhasenha123"
}
```

**Resposta 201**
```json
{ "id": "clxxx..." }
```

**Erros**
| Status | Mensagem |
|---|---|
| 400 | `"Todos os campos são obrigatórios."` |
| 400 | `"Senha deve ter no mínimo 8 caracteres."` |
| 409 | `"Este email já está cadastrado."` |

---

### `GET/POST /api/auth/[...nextauth]`

Handler do NextAuth. Gerencia login, logout, callback OAuth e refresh de sessão. Não é chamado diretamente — use as funções `signIn()` e `signOut()` do `next-auth/react`.

---

## Projetos

### `GET /api/projects`

Lista todos os projetos da organization do usuário autenticado.

**Resposta 200**
```json
{
  "projects": [
    {
      "id": "clxxx...",
      "name": "API Core",
      "githubOwner": "minha-org",
      "githubRepo": "api-core",
      "syncStatus": "COMPLETED",
      "commentCount": 2847,
      "lastSyncAt": "2025-05-10T14:32:00.000Z",
      "isActive": true
    }
  ]
}
```

---

### `POST /api/projects`

Cria um novo projeto.

**Body**
```json
{
  "name": "API Core",
  "githubOwner": "minha-org",
  "githubRepo": "api-core",
  "githubToken": "ghp_xxxx"
}
```

> `githubToken` é opcional. Sem ele, o sistema usa `GITHUB_TOKEN` do ambiente (só funciona para repositórios públicos ou se o token de ambiente tiver acesso).

**Resposta 201** — o projeto criado completo.

---

## Reviews

### `POST /api/reviews`

Processa um Pull Request: busca o diff, encontra padrões históricos similares, gera comentários via IA e posta no GitHub.

**Body**
```json
{
  "prUrl": "https://github.com/minha-org/api-core/pull/247",
  "projectId": "clxxx..."
}
```

> `projectId` é opcional. Se omitido, o sistema encontra o projeto automaticamente pelo `owner/repo` da URL. Se nenhum projeto existir, cria um novo automaticamente.

**Resposta 200**
```json
{
  "prTitle": "feat: add rate limiting to auth endpoints",
  "prNumber": 247,
  "commentsPosted": 4,
  "tokensUsed": 1248,
  "comments": [
    {
      "filePath": "src/auth/middleware.ts",
      "lineNumber": 42,
      "body": "Token JWT não está sendo verificado antes do uso. Padrão identificado em 12 PRs anteriores.",
      "severity": "WARNING"
    },
    {
      "filePath": "src/api/users.ts",
      "lineNumber": 87,
      "body": "SQL query construída via concatenação — vulnerabilidade de SQL injection.",
      "severity": "CRITICAL"
    }
  ]
}
```

**Campos de `severity`**

| Valor | Quando usar |
|---|---|
| `CRITICAL` | Segurança, corretude, bugs que quebram funcionalidade |
| `WARNING` | Problemas que precisam atenção mas não bloqueiam |
| `SUGGESTION` | Melhorias de qualidade, legibilidade, performance |
| `INFO` | Observações neutras, contexto adicional |

**Erros**
| Status | Mensagem |
|---|---|
| 400 | `"prUrl is required"` |
| 400 | `"URL de PR inválida. Use: github.com/owner/repo/pull/N"` |
| 500 | `"Erro ao processar review. Verifique as permissões do token GitHub."` |

---

## Sincronização

### `POST /api/sync/:projectId`

Dispara a sincronização do histórico de PRs de um projeto. Roda em background — a resposta é imediata e o processo continua assincronamente.

**Parâmetros de URL**
- `projectId` — ID do projeto (obtido via `GET /api/projects`)

**Resposta 200**
```json
{ "message": "Sync started" }
```

O status do projeto muda para `SYNCING` imediatamente e para `COMPLETED` (ou `FAILED`) ao terminar. Acompanhe via `GET /api/projects`.

**O processo de sync**
1. Busca todos os PRs fechados via GitHub API (paginado)
2. Para cada PR, busca comentários inline e comentários gerais
3. Filtra comentários com menos de 20 caracteres (ruído)
4. Gera embedding vetorial para cada comentário
5. Insere em `PRCommentEmbedding` com `ON CONFLICT DO NOTHING` (idempotente)
6. Atualiza `commentCount` no projeto

**Erros**
| Status | Mensagem |
|---|---|
| 404 | `"Project not found"` |
| 400 | `"No organization"` |

---

## Formato de erros

Todos os endpoints retornam erros no formato:

```json
{ "error": "Mensagem de erro legível" }
```

---

## Usando a API programaticamente

Atualmente a API usa sessão de cookie (NextAuth). Para uso via CLI ou scripts, crie uma API Key no painel `/settings` (em desenvolvimento) e use:

```bash
curl -X POST https://meu-dominio.com/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"prUrl": "https://github.com/org/repo/pull/123"}'
```

> Autenticação via `Authorization: Bearer` ainda está em desenvolvimento. Por enquanto, use a sessão de navegador ou integre via MCP (veja [Agent Skill](agent-skill.md)).
