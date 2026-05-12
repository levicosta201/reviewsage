import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GitPullRequest, CheckCircle2, XCircle, Loader2, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  COMPLETED: { label: "Completo", color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: CheckCircle2 },
  FAILED: { label: "Falhou", color: "#f87171", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  PENDING: { label: "Pendente", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: Clock },
  PROCESSING: { label: "Processando", color: "#818cf8", bg: "rgba(129,140,248,0.1)", icon: Loader2 },
};

export default async function HistoryPage() {
  const session = await auth();

  const orgUser = await db.organizationUser.findFirst({
    where: { userId: session!.user.id },
    include: { organization: true },
  });

  const reviews = await db.reviewSession.findMany({
    where: { organizationId: orgUser?.organizationId ?? "" },
    include: { project: { select: { name: true, githubOwner: true, githubRepo: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Histórico de Reviews</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Todos os pull requests revisados pelo ReviewSage.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {reviews.length === 0 ? (
          <div className="py-20 text-center">
            <GitPullRequest className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
            <p className="font-medium mb-1">Nenhum review ainda</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Acesse &quot;Revisar PR&quot; para fazer sua primeira análise.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Pull Request", "Projeto", "Status", "Comentários", "Tokens", "Data"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {reviews.map((review) => {
                const cfg = statusConfig[review.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                const Icon = cfg.icon;
                return (
                  <tr key={review.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                          <GitPullRequest className="h-4 w-4" style={{ color: cfg.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[220px]">{review.prTitle ?? `PR #${review.prNumber}`}</p>
                          <p className="text-xs font-mono truncate max-w-[220px]" style={{ color: "var(--muted-foreground)" }}>
                            {review.prUrl}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm">{review.project?.name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                        {review.project?.githubOwner}/{review.project?.githubRepo}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className="flex items-center gap-1 w-fit" style={{ background: cfg.bg, color: cfg.color, border: "none", fontSize: "11px" }}>
                        <Icon className={`h-3 w-3 ${review.status === "PROCESSING" ? "animate-spin" : ""}`} />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm">{review.commentsPosted ?? "—"}</td>
                    <td className="px-5 py-4">
                      {review.tokensUsed != null ? (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          <Zap className="h-3 w-3" style={{ color: "#a78bfa" }} />
                          {review.tokensUsed.toLocaleString("pt-BR")}
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(review.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
