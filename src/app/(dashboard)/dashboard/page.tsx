import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GitPullRequest, Database, Zap, TrendingUp, Plus, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();

  const [orgUser] = await db.organizationUser.findMany({
    where: { userId: session!.user.id },
    include: { organization: { include: { projects: true, reviewSessions: { take: 5, orderBy: { createdAt: "desc" } } } } },
    take: 1,
  });

  const org = orgUser?.organization;
  const projects = org?.projects ?? [];
  const recentReviews = org?.reviewSessions ?? [];

  const totalComments = projects.reduce((sum, p) => sum + p.commentCount, 0);
  const totalReviews = await db.reviewSession.count({ where: { organizationId: org?.id ?? "" } });
  const totalTokens = await db.reviewSession.aggregate({
    _sum: { tokensUsed: true },
    where: { organizationId: org?.id ?? "" },
  });

  const stats = [
    { label: "Projetos", value: projects.length, icon: Database, color: "#818cf8" },
    { label: "Reviews realizados", value: totalReviews, icon: GitPullRequest, color: "#34d399" },
    { label: "Comentários históricos", value: totalComments.toLocaleString("pt-BR"), icon: TrendingUp, color: "#fbbf24" },
    { label: "Tokens usados total", value: (totalTokens._sum.tokensUsed ?? 0).toLocaleString("pt-BR"), icon: Zap, color: "#a78bfa" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Olá, {session!.user?.name?.split(" ")[0]}! Aqui está o resumo do workspace.
          </p>
        </div>
        <Link href="/review">
          <Button style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} className="gap-2">
            <GitPullRequest className="h-4 w-4" />
            Revisar PR
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-1 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold">Projetos</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {projects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>Nenhum projeto ainda</p>
                <Link href="/projects">
                  <Button size="sm" variant="outline" className="gap-1.5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar projeto
                  </Button>
                </Link>
              </div>
            ) : (
              projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                      {project.githubOwner}/{project.githubRepo}
                    </p>
                  </div>
                  <Badge
                    style={{
                      background: project.syncStatus === "COMPLETED" ? "rgba(52,211,153,0.1)" : "rgba(107,107,138,0.1)",
                      color: project.syncStatus === "COMPLETED" ? "#34d399" : "var(--muted-foreground)",
                      border: "none",
                      fontSize: "10px",
                    }}
                  >
                    {project.commentCount} comentários
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="lg:col-span-2 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold">Reviews recentes</h2>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentReviews.length === 0 ? (
              <div className="py-12 text-center">
                <GitPullRequest className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>Nenhum review ainda</p>
                <Link href="/review">
                  <Button size="sm" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} className="gap-1.5">
                    <GitPullRequest className="h-3.5 w-3.5" /> Fazer primeiro review
                  </Button>
                </Link>
              </div>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="flex items-center gap-4 px-5 py-4">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      review.status === "COMPLETED" ? "" : review.status === "FAILED" ? "" : ""
                    }`}
                    style={{
                      background:
                        review.status === "COMPLETED"
                          ? "rgba(52,211,153,0.1)"
                          : review.status === "FAILED"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(124,58,237,0.1)",
                    }}
                  >
                    <GitPullRequest
                      className="h-4 w-4"
                      style={{
                        color:
                          review.status === "COMPLETED"
                            ? "#34d399"
                            : review.status === "FAILED"
                            ? "#f87171"
                            : "#a78bfa",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{review.prTitle ?? `PR #${review.prNumber}`}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                      {review.prUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {review.commentsPosted != null && (
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {review.commentsPosted} comentários
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Clock className="h-3 w-3" />
                      {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
