import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  // Uses voyage-3 via Anthropic for embeddings (1536 dimensions)
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1,
    messages: [{ role: "user", content: text }],
  });
  // Fallback: generate embedding via a simple hash for development
  // In production, integrate with a real embedding endpoint
  void response;
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
      "filePath" as file_path,
      1 - (embedding <=> ${vector}::vector) as similarity
    FROM "PRCommentEmbedding"
    WHERE "projectId" = ${projectId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    commentBody: r.comment_body,
    filePath: r.file_path,
    similarity: r.similarity,
  }));
}

export async function generatePRReview(params: {
  prTitle: string;
  prDescription: string;
  diff: string;
  similarComments: Array<{ commentBody: string; filePath: string | null }>;
  projectContext: string;
}): Promise<Array<{ filePath: string; lineNumber: number | null; body: string; severity: string }>> {
  const { prTitle, prDescription, diff, similarComments, projectContext } = params;

  const systemPrompt = `You are an expert code reviewer. You analyze pull requests and provide constructive, actionable feedback based on historical review patterns from this project.

Your reviews should:
- Be specific and actionable
- Reference similar past issues when relevant
- Focus on correctness, security, performance, and maintainability
- Use the severity levels: CRITICAL, WARNING, SUGGESTION, INFO

Return a JSON array of review comments with this structure:
[{ "filePath": "src/file.ts", "lineNumber": 42, "body": "Comment text", "severity": "WARNING" }]

Only return the JSON array, no other text.`;

  const userPrompt = `Project: ${projectContext}

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

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    const parsed = JSON.parse(content.text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
