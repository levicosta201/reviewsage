"use client";

import { useState, useEffect } from "react";
import { Plus, Github, RefreshCw, Loader2, FolderGit2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  syncStatus: string;
  commentCount: number;
  lastSyncAt: string | null;
  isActive: boolean;
};

const syncStatusConfig = {
  IDLE: { label: "Não sincronizado", color: "var(--muted-foreground)", bg: "rgba(107,107,138,0.1)", icon: Clock },
  SYNCING: { label: "Sincronizando...", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: Loader2 },
  COMPLETED: { label: "Sincronizado", color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: CheckCircle2 },
  FAILED: { label: "Falha", color: "#f87171", bg: "rgba(239,68,68,0.1)", icon: AlertCircle },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", githubOwner: "", githubRepo: "", githubToken: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", githubOwner: "", githubRepo: "", githubToken: "" });
        setShowForm(false);
        fetchProjects();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSync(projectId: string) {
    setSyncing(projectId);
    try {
      await fetch(`/api/sync/${projectId}`, { method: "POST" });
      setTimeout(fetchProjects, 2000);
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Projetos</h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Gerencie os repositórios GitHub que o ReviewSage monitora.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Plus className="h-4 w-4" />
          Adicionar projeto
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--card)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <h2 className="font-semibold mb-4">Novo projeto</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Nome do projeto</label>
              <Input
                placeholder="ex: API Core"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">GitHub Owner</label>
              <Input
                placeholder="minha-empresa"
                value={form.githubOwner}
                onChange={(e) => setForm({ ...form, githubOwner: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Repositório</label>
              <Input
                placeholder="api-core"
                value={form.githubRepo}
                onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                GitHub Token (Personal Access Token)
                <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  Necessário para acessar repositórios privados
                </span>
              </label>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={form.githubToken}
                onChange={(e) => setForm({ ...form, githubToken: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <FolderGit2 className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
          <h3 className="font-semibold mb-2">Nenhum projeto ainda</h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
            Adicione seu primeiro repositório GitHub para começar.
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Plus className="h-4 w-4" /> Adicionar projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusCfg = syncStatusConfig[project.syncStatus as keyof typeof syncStatusConfig] ?? syncStatusConfig.IDLE;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={project.id}
                className="rounded-xl p-5 card-hover"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                    <Github className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </div>
                  <Badge
                    className="flex items-center gap-1"
                    style={{ background: statusCfg.bg, color: statusCfg.color, border: "none", fontSize: "11px" }}
                  >
                    <StatusIcon className={`h-3 w-3 ${project.syncStatus === "SYNCING" ? "animate-spin" : ""}`} />
                    {statusCfg.label}
                  </Badge>
                </div>

                <h3 className="font-semibold mb-0.5">{project.name}</h3>
                <p className="text-sm mb-4 font-mono" style={{ color: "var(--muted-foreground)" }}>
                  {project.githubOwner}/{project.githubRepo}
                </p>

                <div className="flex items-center justify-between text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                  <span>{project.commentCount.toLocaleString("pt-BR")} comentários indexados</span>
                  {project.lastSyncAt && (
                    <span>Sync: {new Date(project.lastSyncAt).toLocaleDateString("pt-BR")}</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleSync(project.id)}
                  disabled={syncing === project.id || project.syncStatus === "SYNCING"}
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  {syncing === project.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Sincronizar histórico
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
