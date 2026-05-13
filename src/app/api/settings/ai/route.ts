import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAISettings } from "@/lib/ai";

async function getOrgId(userId: string) {
  const orgUser = await db.organizationUser.findFirst({ where: { userId } });
  return orgUser?.organizationId ?? null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = await getOrgId(session.user.id);
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const settings = await getAISettings(organizationId);

  // Never expose the raw key — return a boolean and a masked hint instead
  const { anthropicApiKey, ...rest } = settings;
  return NextResponse.json({
    ...rest,
    anthropicApiKeySet: !!anthropicApiKey,
    anthropicApiKeyHint: anthropicApiKey
      ? `sk-ant-...${anthropicApiKey.slice(-4)}`
      : null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = await getOrgId(session.user.id);
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();

  // Only update the key if a non-empty value was explicitly sent
  const keyUpdate = body.anthropicApiKey !== undefined && body.anthropicApiKey !== ""
    ? { anthropicApiKey: body.anthropicApiKey }
    : body.anthropicApiKey === ""
      ? { anthropicApiKey: null }   // empty string = clear the key
      : {};

  const updated = await db.aISettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      provider: body.provider,
      anthropicModel: body.anthropicModel,
      ollamaBaseUrl: body.ollamaBaseUrl,
      ollamaModel: body.ollamaModel,
      ...keyUpdate,
    },
    update: {
      provider: body.provider,
      anthropicModel: body.anthropicModel,
      ollamaBaseUrl: body.ollamaBaseUrl,
      ollamaModel: body.ollamaModel,
      ...keyUpdate,
    },
  });

  const { anthropicApiKey, ...rest } = updated;
  return NextResponse.json({
    ...rest,
    anthropicApiKeySet: !!anthropicApiKey,
    anthropicApiKeyHint: anthropicApiKey ? `sk-ant-...${anthropicApiKey.slice(-4)}` : null,
  });
}
