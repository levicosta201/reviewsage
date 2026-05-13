import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { testAnthropicConnection, testOpenAIConnection, testOllamaConnection } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgUser = await db.organizationUser.findFirst({ where: { userId: session.user.id } });
  const organizationId = orgUser?.organizationId;

  const { provider, anthropicModel, anthropicApiKey, openaiModel, openaiApiKey, ollamaBaseUrl, ollamaModel } =
    await req.json();

  if (provider === "OLLAMA") {
    return NextResponse.json(await testOllamaConnection(ollamaBaseUrl, ollamaModel));
  }

  if (provider === "OPENAI") {
    let key = openaiApiKey || null;
    if (!key && organizationId) {
      const saved = await db.aISettings.findUnique({ where: { organizationId } });
      key = saved?.openaiApiKey ?? null;
    }
    return NextResponse.json(await testOpenAIConnection(openaiModel, key));
  }

  // Anthropic
  let key = anthropicApiKey || null;
  if (!key && organizationId) {
    const saved = await db.aISettings.findUnique({ where: { organizationId } });
    key = saved?.anthropicApiKey ?? null;
  }
  return NextResponse.json(await testAnthropicConnection(anthropicModel, key));
}
