import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { testAnthropicConnection, testOllamaConnection } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgUser = await db.organizationUser.findFirst({ where: { userId: session.user.id } });
  const organizationId = orgUser?.organizationId;

  const { provider, anthropicModel, anthropicApiKey, ollamaBaseUrl, ollamaModel } = await req.json();

  if (provider === "OLLAMA") {
    const result = await testOllamaConnection(ollamaBaseUrl, ollamaModel);
    return NextResponse.json(result);
  }

  // For Anthropic: prefer the key sent in the request body (user is typing a new one),
  // fall back to the one already saved in the DB.
  let keyToUse = anthropicApiKey || null;
  if (!keyToUse && organizationId) {
    const saved = await db.aISettings.findUnique({ where: { organizationId } });
    keyToUse = saved?.anthropicApiKey ?? null;
  }

  const result = await testAnthropicConnection(anthropicModel, keyToUse);
  return NextResponse.json(result);
}
