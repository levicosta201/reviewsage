import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Bot, Copy, Download, Zap, Code2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AgentSkillPage() {
  const session = await auth();

  const orgUser = await db.organizationUser.findFirst({
    where: { userId: session!.user.id },
    include: { organization: { include: { projects: true } } },
  });

  const projects = orgUser?.organization?.projects ?? [];
  const totalComments = projects.reduce((sum, p) => sum + p.commentCount, 0);

  const skillJson = JSON.stringify(
    {
      name: "pr_review",
      description: `Reviews pull requests based on ${totalComments} historical review comments from ${projects.length} project(s). Uses vector similarity to find relevant patterns and generates actionable feedback.`,
      endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/agent-skill`,
      parameters: {
        pr_url: { type: "string", description: "GitHub Pull Request URL" },
        project_id: { type: "string", description: "ReviewSage project ID (optional)" },
      },
      auth: { type: "api_key", header: "X-ReviewSage-Key" },
    },
    null,
    2
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Agent Skill</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Exporte o conhecimento acumulado como uma skill para agentes de IA.
        </p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Projetos indexados", value: projects.length, color: "#818cf8" },
          { label: "Comentários históricos", value: totalComments.toLocaleString("pt-BR"), color: "#34d399" },
          { label: "Skill status", value: totalComments > 0 ? "Pronto" : "Sem dados", color: totalComments > 0 ? "#34d399" : "#fbbf24" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Skill definition */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" style={{ color: "#818cf8" }} />
            <span className="font-semibold text-sm">Skill Definition (JSON)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Copy className="h-3.5 w-3.5" /> Copiar
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Baixar
            </Button>
          </div>
        </div>
        <pre className="p-5 text-sm overflow-x-auto font-mono" style={{ color: "#a78bfa", background: "#0a0a12" }}>
          {skillJson}
        </pre>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <h2 className="font-semibold">Como usar em agentes</h2>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>1</div>
            <span className="font-medium text-sm">Claude Code / Claude Agent SDK</span>
          </div>
          <pre className="text-xs font-mono p-3 rounded-lg overflow-x-auto" style={{ background: "#0a0a12", color: "#a78bfa" }}>
{`# No seu CLAUDE.md ou settings.json
{
  "mcpServers": {
    "reviewsage": {
      "url": "${process.env.NEXT_PUBLIC_APP_URL}/api/mcp",
      "apiKey": "sua-api-key-aqui"
    }
  }
}`}
          </pre>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>2</div>
            <span className="font-medium text-sm">REST API direto</span>
          </div>
          <pre className="text-xs font-mono p-3 rounded-lg overflow-x-auto" style={{ background: "#0a0a12", color: "#a78bfa" }}>
{`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL}/api/reviews \\
  -H "Authorization: Bearer sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"prUrl": "https://github.com/owner/repo/pull/123"}'`}
          </pre>
        </div>

        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "#34d399" }}>Economia de tokens garantida</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              A skill só consome tokens quando chamada explicitamente pelo agente. O banco vetorial histórico é persistente e não precisa ser recalculado a cada chamada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
