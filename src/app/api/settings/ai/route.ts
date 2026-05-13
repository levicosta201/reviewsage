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
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = await getOrgId(session.user.id);
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();

  const updated = await db.aISettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      provider: body.provider,
      anthropicModel: body.anthropicModel,
      ollamaBaseUrl: body.ollamaBaseUrl,
      ollamaModel: body.ollamaModel,
    },
    update: {
      provider: body.provider,
      anthropicModel: body.anthropicModel,
      ollamaBaseUrl: body.ollamaBaseUrl,
      ollamaModel: body.ollamaModel,
    },
  });

  return NextResponse.json(updated);
}
