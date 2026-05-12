import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  Brain,
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  History,
  Settings,
  LogOut,
  Bot,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects",     icon: FolderGit2,      label: "Projetos" },
  { href: "/review",       icon: GitPullRequest,  label: "Revisar PR" },
  { href: "/history",      icon: History,         label: "Histórico" },
  { href: "/agent-skill",  icon: Bot,             label: "Agent Skill" },
  { href: "/settings",     icon: Settings,        label: "Configurações" },
];

const docItems = [
  { href: "/docs/github-auth", icon: BookOpen, label: "Auth GitHub" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">ReviewSage</span>
        </div>

        {/* Nav */}
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

          <div className="pt-3 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="px-3 pb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
              Documentação
            </p>
            {docItems.map((item) => (
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
          </div>
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
            >
              {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name ?? "Usuário"}</p>
              <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                {session.user?.email}
              </p>
            </div>
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
