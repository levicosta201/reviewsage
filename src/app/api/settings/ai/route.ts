import { NextRequest, NextResponse } from "next/server";
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

  const keyFields = {
    ...(body.anthropicApiKey !== undefined
      ? { anthropicApiKey: body.anthropicApiKey === "" ? null : body.anthropicApiKey }
      : {}),
    ...(body.openaiApiKey !== undefined
      ? { openaiApiKey: body.openaiApiKey === "" ? null : body.openaiApiKey }
      : {}),
  };

  const data = {
    provider:       body.provider,
    anthropicModel: body.anthropicModel,
    openaiModel:    body.openaiModel,
    ollamaBaseUrl:  body.ollamaBaseUrl,
    ollamaModel:    body.ollamaModel,
    ...keyFields,
  };

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
}
