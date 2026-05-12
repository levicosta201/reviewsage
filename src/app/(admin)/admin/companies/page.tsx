import { db } from "@/lib/db";
import { Building2, Users, GitPullRequest, Database, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function CompaniesPage() {
  const companies = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, projects: true, reviewSessions: true } },
      users: { include: { user: { select: { name: true, email: true } } }, where: { role: "OWNER" }, take: 1 },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Empresas</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {companies.length} empresa{companies.length !== 1 ? "s" : ""} cadastrada{companies.length !== 1 ? "s" : ""}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map((company) => {
          const owner = company.users[0]?.user;
          return (
            <div key={company.id} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <Building2 className="h-5 w-5" style={{ color: "#a78bfa" }} />
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: company.plan === "ENTERPRISE" ? "rgba(251,191,36,0.1)" : company.plan === "PRO" ? "rgba(124,58,237,0.1)" : "rgba(107,107,138,0.1)",
                    color: company.plan === "ENTERPRISE" ? "#fbbf24" : company.plan === "PRO" ? "#a78bfa" : "var(--muted-foreground)",
                  }}
                >
                  {company.plan}
                </span>
              </div>

              <h3 className="font-semibold mb-0.5">{company.name}</h3>
              <p className="text-xs font-mono mb-3" style={{ color: "var(--muted-foreground)" }}>/{company.slug}</p>

              {owner && (
                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Owner: {owner.name ?? owner.email}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Users, value: company._count.users, label: "users" },
                  { icon: Database, value: company._count.projects, label: "projetos" },
                  { icon: GitPullRequest, value: company._count.reviewSessions, label: "reviews" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="font-bold text-sm">{m.value}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Criada em {new Date(company.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
