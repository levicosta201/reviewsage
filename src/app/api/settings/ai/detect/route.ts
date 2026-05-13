import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Ollama } from "ollama";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

  try {
    const ollama = new Ollama({ host: baseUrl });
    const start = Date.now();
    const { models } = await ollama.list();
    return NextResponse.json({
      available: true,
      baseUrl,
      latency: Date.now() - start,
      models: models.map((m) => m.name),
    });
  } catch {
    return NextResponse.json({ available: false, baseUrl, models: [] });
  }
}
