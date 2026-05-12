import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Brain, LayoutDashboard, Building2, Users, BarChart3, Settings, Shield } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Visão geral" },
  { href: "/admin/companies", icon: Building2, label: "Empresas" },
  { href: "/admin/users", icon: Users, label: "Usuários" },
  { href: "/admin/usage", icon: BarChart3, label: "Uso & Métricas" },
  { href: "/admin/settings", icon: Settings, label: "Configurações" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}>
        <div className="h-16 flex items-center gap-2.5 px-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold block leading-none">ReviewSage</span>
            <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#f87171" }}>
              <Shield className="h-3 w-3" /> Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:text-white"
              style={{ color: "var(--muted-foreground)" }}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
            ← Voltar ao Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
