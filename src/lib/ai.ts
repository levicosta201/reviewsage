import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { Ollama } from "ollama";
import { db } from "./db";

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

// ── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert code reviewer. You analyze pull requests and provide constructive, actionable feedback based on historical review patterns from this project.

Your reviews should:
- Be specific and actionable
- Reference similar past issues when relevant
- Focus on correctness, security, performance, and maintainability
- Use the severity levels: CRITICAL, WARNING, SUGGESTION, INFO

Return a JSON array of review comments with this structure:
[{ "filePath": "src/file.ts", "lineNumber": 42, "body": "Comment text", "severity": "WARNING" }]

Only return the JSON array, no other text.`;

function buildUserPrompt(params: {
  prTitle: string;
  prDescription: string;
  diff: string;
  similarComments: Array<{ commentBody: string; filePath: string | null }>;
  projectContext: string;
}) {
  const { prTitle, prDescription, diff, similarComments, projectContext } = params;
  return `Project: ${projectContext}

PR Title: ${prTitle}
PR Description: ${prDescription || "No description provided"}

Historical review patterns from this project (use these as guidance):
${similarComments
  .slice(0, 8)
  .map((c) => `- ${c.filePath ? `[${c.filePath}]` : ""} ${c.commentBody}`)
  .join("\n")}

Diff to review:
\`\`\`diff
${diff.slice(0, 12000)}
\`\`\`

Generate specific, actionable review comments based on the diff and historical patterns.`;
}

function parseReviewJson(text: string) {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Anthropic ────────────────────────────────────────────────────────────────

function makeAnthropicClient(apiKey?: string | null) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Chave da API Anthropic não configurada. Adicione em Configurações.");
  return new Anthropic({ apiKey: key });
}

async function reviewWithAnthropic(
  model: string,
  apiKey: string | null | undefined,
  params: Parameters<typeof buildUserPrompt>[0]
) {
  const client = makeAnthropicClient(apiKey);
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(params) }],
  });
  const content = response.content[0];
  return content.type === "text" ? parseReviewJson(content.text) : [];
}

export async function testAnthropicConnection(
  model: string,
  apiKey?: string | null
): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const client = makeAnthropicClient(apiKey);
    await client.messages.create({ model, max_tokens: 8, messages: [{ role: "user", content: "ping" }] });
    return { ok: true, latency: Date.now() - start };
  } catch (e) {
    return { ok: false, latency: Date.now() - start, error: String(e) };
  }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

function makeOpenAIClient(apiKey?: string | null) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Chave da API OpenAI não configurada. Adicione em Configurações.");
  return new OpenAI({ apiKey: key });
}

async function reviewWithOpenAI(
  model: string,
  apiKey: string | null | undefined,
  params: Parameters<typeof buildUserPrompt>[0]
) {
  const client = makeOpenAIClient(apiKey);
  const response = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserPrompt(params) },
    ],
  });
  const text = response.choices[0]?.message?.content ?? "";
  return parseReviewJson(text);
}

export async function testOpenAIConnection(
  model: string,
  apiKey?: string | null
): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const client = makeOpenAIClient(apiKey);
    await client.chat.completions.create({
      model,
      max_tokens: 8,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true, latency: Date.now() - start };
  } catch (e) {
    return { ok: false, latency: Date.now() - start, error: String(e) };
  }
}

// ── Ollama ───────────────────────────────────────────────────────────────────

async function reviewWithOllama(
  baseUrl: string,
  model: string,
  params: Parameters<typeof buildUserPrompt>[0]
) {
  const ollama = new Ollama({ host: baseUrl });
  const response = await ollama.chat({
    model,
    stream: false,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserPrompt(params) },
    ],
  });
  return parseReviewJson(response.message.content);
}

export async function testOllamaConnection(
  baseUrl: string,
  model: string
): Promise<{ ok: boolean; latency: number; models?: string[]; error?: string }> {
  const start = Date.now();
  try {
    const ollama = new Ollama({ host: baseUrl });
    const { models } = await ollama.list();
    const names = models.map((m) => m.name);
    const modelAvailable = names.some((n) => n.startsWith(model));
    if (!modelAvailable) {
      return {
        ok: false,
        latency: Date.now() - start,
        models: names,
        error: `Modelo "${model}" não encontrado. Baixe com: ollama pull ${model}`,
      };
    }
    return { ok: true, latency: Date.now() - start, models: names };
  } catch (e) {
    return { ok: false, latency: Date.now() - start, error: String(e) };
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getAISettings(organizationId: string) {
  const s = await db.aISettings.findUnique({ where: { organizationId } });
  return s ?? {
    provider:        "ANTHROPIC" as const,
    anthropicApiKey: null,
    anthropicModel:  "claude-haiku-4-5-20251001",
    openaiApiKey:    null,
    openaiModel:     "gpt-4o-mini",
    ollamaBaseUrl:   DEFAULT_OLLAMA_URL,
    ollamaModel:     "llama3.2",
  };
}

export async function generateEmbedding(_text: string): Promise<number[]> {
  // Placeholder — production: use voyage-3 (Anthropic) or text-embedding-3-small (OpenAI)
  return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
}

export async function findSimilarComments(
  projectId: string,
  queryEmbedding: number[],
  limit = 10
): Promise<Array<{ commentBody: string; filePath: string | null; similarity: number }>> {
  const vector = `[${queryEmbedding.join(",")}]`;
  const results = await db.$queryRaw<
    Array<{ comment_body: string; file_path: string | null; similarity: number }>
  >`
    SELECT
      "commentBody" as comment_body,
      "filePath"    as file_path,
      1 - (embedding <=> ${vector}::vector) as similarity
    FROM "PRCommentEmbedding"
    WHERE "projectId" = ${projectId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;
  return results.map((r) => ({
    commentBody: r.comment_body,
    filePath:    r.file_path,
    similarity:  r.similarity,
  }));
}

export async function generatePRReview(
  params: {
    prTitle: string;
    prDescription: string;
    diff: string;
    similarComments: Array<{ commentBody: string; filePath: string | null }>;
    projectContext: string;
  },
  organizationId: string
): Promise<Array<{ filePath: string; lineNumber: number | null; body: string; severity: string }>> {
  const s = await getAISettings(organizationId);

  if (s.provider === "OPENAI")   return reviewWithOpenAI(s.openaiModel, s.openaiApiKey, params);
  if (s.provider === "OLLAMA")   return reviewWithOllama(s.ollamaBaseUrl, s.ollamaModel, params);
  return reviewWithAnthropic(s.anthropicModel, s.anthropicApiKey, params);
}
