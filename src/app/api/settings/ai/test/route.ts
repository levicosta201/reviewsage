import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testAnthropicConnection, testOllamaConnection } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, anthropicModel, ollamaBaseUrl, ollamaModel } = await req.json();

  if (provider === "OLLAMA") {
    const result = await testOllamaConnection(ollamaBaseUrl, ollamaModel);
    return NextResponse.json(result);
  }

  const result = await testAnthropicConnection(anthropicModel);
  return NextResponse.json(result);
}
