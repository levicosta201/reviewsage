import { db } from "@/lib/db";
import { Building2, Users, GitPullRequest, Database, Zap, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const [orgCount, userCount, reviewCount, projectCount, tokenSum] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.reviewSession.count(),
    db.project.count(),
    db.reviewSession.aggregate({ _sum: { tokensUsed: true } }),
  ]);

  const recentOrgs = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      _count: { select: { users: true, projects: true, reviewSessions: true } },
    },
  });

  const stats = [
    { label: "Empresas", value: orgCount, icon: Building2, color: "#818cf8" },
    { label: "Usuários", value: userCount, icon: Users, color: "#34d399" },
    { label: "Projetos", value: projectCount, icon: Database, color: "#fbbf24" },
    { label: "Reviews totais", value: reviewCount, icon: GitPullRequest, color: "#f87171" },
    { label: "Tokens consumidos", value: (tokenSum._sum.tokensUsed ?? 0).toLocaleString("pt-BR"), icon: Zap, color: "#a78bfa" },
    { label: "Tx média reviews/empresa", value: orgCount > 0 ? (reviewCount / orgCount).toFixed(1) : "0", icon: TrendingUp, color: "#38bdf8" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Visão Geral — Admin</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Métricas globais da plataforma ReviewSage.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent companies */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold">Empresas recentes</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Empresa", "Plano", "Usuários", "Projetos", "Reviews", "Criada em"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{org.slug}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: org.plan === "ENTERPRISE" ? "rgba(251,191,36,0.1)" : org.plan === "PRO" ? "rgba(124,58,237,0.1)" : "rgba(107,107,138,0.1)",
                      color: org.plan === "ENTERPRISE" ? "#fbbf24" : org.plan === "PRO" ? "#a78bfa" : "var(--muted-foreground)",
                    }}
                  >
                    {org.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm">{org._count.users}</td>
                <td className="px-5 py-3.5 text-sm">{org._count.projects}</td>
                <td className="px-5 py-3.5 text-sm">{org._count.reviewSessions}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
