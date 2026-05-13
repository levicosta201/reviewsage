import { NextRequest, NextResponse } from "next/server";
import { AIProvider } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAISettings } from "@/lib/ai";

async function getOrgId(userId: string) {
  const orgUser = await db.organizationUser.findFirst({ where: { userId } });
  return orgUser?.organizationId ?? null;
}

function maskKey(key: string | null | undefined, prefix = "sk-") {
  if (!key) return null;
  return `${prefix}...${key.slice(-4)}`;
}

const VALID_PROVIDERS: AIProvider[] = ["ANTHROPIC", "OPENAI", "OLLAMA"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = await getOrgId(session.user.id);
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const settings = await getAISettings(organizationId);
  const { anthropicApiKey, openaiApiKey, ...rest } = settings;

  return NextResponse.json({
    ...rest,
    anthropicApiKeySet:  !!anthropicApiKey,
    anthropicApiKeyHint: maskKey(anthropicApiKey, "sk-ant-"),
    openaiApiKeySet:     !!openaiApiKey,
    openaiApiKeyHint:    maskKey(openaiApiKey, "sk-"),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = await getOrgId(session.user.id);
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();

  const provider = VALID_PROVIDERS.includes(body.provider) ? (body.provider as AIProvider) : "ANTHROPIC";

  const keyFields = {
    ...(body.anthropicApiKey !== undefined
      ? { anthropicApiKey: body.anthropicApiKey === "" ? null : String(body.anthropicApiKey) }
      : {}),
    ...(body.openaiApiKey !== undefined
      ? { openaiApiKey: body.openaiApiKey === "" ? null : String(body.openaiApiKey) }
      : {}),
  };

  const data = {
    provider,
    anthropicModel: body.anthropicModel ?? "claude-haiku-4-5-20251001",
    openaiModel:    body.openaiModel    ?? "gpt-4o-mini",
    ollamaBaseUrl:  body.ollamaBaseUrl  ?? "http://localhost:11434",
    ollamaModel:    body.ollamaModel    ?? "llama3.2",
    ...keyFields,
  };

  try {
    const updated = await db.aISettings.upsert({
      where:  { organizationId },
      create: { organizationId, ...data },
      update: data,
    });

    const { anthropicApiKey, openaiApiKey, ...rest } = updated;
    return NextResponse.json({
      ...rest,
      anthropicApiKeySet:  !!anthropicApiKey,
      anthropicApiKeyHint: maskKey(anthropicApiKey, "sk-ant-"),
      openaiApiKeySet:     !!openaiApiKey,
      openaiApiKeyHint:    maskKey(openaiApiKey, "sk-"),
    });
  } catch (err) {
    console.error("[settings/ai PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
