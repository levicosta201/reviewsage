# Agent Skill

O ReviewSage pode ser usado como uma **skill** em agentes de IA — uma ferramenta que o agente chama quando precisa revisar um Pull Request, sem gastar tokens para carregar o histórico inteiro.

---

## Como funciona

```
Agente recebe tarefa: "Revise o PR #247"
         │
         ▼
Agente chama ReviewSage (skill)
  → POST /api/reviews { prUrl }
         │
         ▼
ReviewSage busca no banco vetorial (já construído)
encontra padrões similares → Claude Haiku → posta comentários
         │
         ▼
Agente recebe: { comments, tokensUsed, commentsPosted }
```

**Por que isso economiza tokens do agente?**

Sem o ReviewSage, o agente precisaria carregar o histórico inteiro de comentários no contexto para ter referência. Com o ReviewSage, o histórico fica no banco vetorial — o agente só paga pelos tokens do diff + resposta.

---

## Uso via REST

### Requisição

```bash
curl -X POST https://meu-dominio.com/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUA_API_KEY" \
  -d '{"prUrl": "https://github.com/org/repo/pull/123"}'
```

### Resposta

```json
{
  "prTitle": "feat: add rate limiting",
  "prNumber": 123,
  "commentsPosted": 3,
  "tokensUsed": 1180,
  "comments": [
    {
      "filePath": "src/middleware/rateLimit.ts",
      "lineNumber": 15,
      "body": "O intervalo de reset deve ser configurável via env, não hardcoded.",
      "severity": "SUGGESTION"
    }
  ]
}
```

---

## Uso com Claude Code (MCP)

Adicione o ReviewSage como servidor MCP no seu `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "reviewsage": {
      "url": "https://meu-dominio.com/api/mcp",
      "apiKey": "sua-api-key"
    }
  }
}
```

> O endpoint MCP ainda está em desenvolvimento. Acompanhe as releases.

---

## Uso com CLAUDE.md

Para que o Claude Code revise PRs automaticamente quando solicitado, adicione ao seu `CLAUDE.md`:

````markdown
## Code Review

Quando solicitado a revisar um PR, use o ReviewSage:

```bash
curl -X POST https://meu-dominio.com/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"prUrl": "<URL_DO_PR>"}'
```

Os comentários são postados automaticamente no PR. Informe ao usuário
o número de comentários e os itens críticos encontrados.
```
````

---

## Exportando a Skill Definition

Na página `/agent-skill` do painel, você encontra a definição JSON da skill:

```json
{
  "name": "pr_review",
  "description": "Reviews pull requests based on N historical review comments...",
  "endpoint": "https://meu-dominio.com/api/agent-skill",
  "parameters": {
    "pr_url": {
      "type": "string",
      "description": "GitHub Pull Request URL"
    },
    "project_id": {
      "type": "string",
      "description": "ReviewSage project ID (optional)"
    }
  },
  "auth": {
    "type": "api_key",
    "header": "X-ReviewSage-Key"
  }
}
```

Esta definição pode ser importada em plataformas que suportam tool/function calling (OpenAI, Anthropic, LangChain, etc.).

---

## Uso com Anthropic Tool Use

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "review_pr",
        "description": "Reviews a GitHub Pull Request using historical patterns. Posts comments directly to the PR.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pr_url": {
                    "type": "string",
                    "description": "GitHub Pull Request URL (e.g. https://github.com/org/repo/pull/123)"
                }
            },
            "required": ["pr_url"]
        }
    }
]

# No seu loop de tool use, ao receber review_pr:
def handle_review_pr(pr_url: str) -> dict:
    import requests
    response = requests.post(
        "https://meu-dominio.com/api/reviews",
        json={"prUrl": pr_url},
        headers={"Authorization": "Bearer SUA_API_KEY"}
    )
    return response.json()
```

---

## Notas de custo

A skill só consome tokens quando chamada. O banco vetorial histórico é persistente — não é reconstruído a cada chamada.

| Operação | Custo de tokens |
|---|---|
| Sync inicial de histórico | Pago uma vez (embeddings do histórico) |
| Cada review | ~800–2.000 tokens (diff + geração) |
| Consulta ao banco vetorial | 0 tokens (SQL puro) |

Quanto maior o histórico sincronizado, **melhor a qualidade** dos reviews — sem custo adicional por consulta.
