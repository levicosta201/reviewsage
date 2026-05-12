"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Github, RefreshCw, Loader2, FolderGit2,
  CheckCircle2, AlertCircle, Clock, Key, Bot,
  BookOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type AuthType = "PAT" | "GITHUB_APP";

type Project = {
  id: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  authType: AuthType;
  syncStatus: string;
  commentCount: number;
  lastSyncAt: string | null;
  isActive: boolean;
};

const syncStatusConfig = {
  IDLE:      { label: "Não sincronizado", color: "var(--muted-foreground)", bg: "rgba(107,107,138,0.1)", icon: Clock },
  SYNCING:   { label: "Sincronizando...",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: Loader2 },
  COMPLETED: { label: "Sincronizado",      color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: CheckCircle2 },
  FAILED:    { label: "Falha",             color: "#f87171", bg: "rgba(239,68,68,0.1)",   icon: AlertCircle },
};

const authMethodConfig = {
  PAT:        { label: "Token Pessoal",  icon: Key,  color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  GITHUB_APP: { label: "GitHub App",    icon: Bot,  color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
};

const emptyForm = {
  name: "", githubOwner: "", githubRepo: "",
  authType: "PAT" as AuthType,
  githubToken: "",
  githubAppId: "", githubAppPrivateKey: "", githubInstallationId: "",
};

export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState<string | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [showPAT, setShowPAT]     = useState(false);
  const [showPEM, setShowPEM]     = useState(false);

  useEffect(() => { fetchProjects(); }, []);

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
      if (res.ok) { setForm(emptyForm); setShowForm(false); fetchProjects(); }
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

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Projetos</h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Gerencie os repositórios GitHub monitorados pelo ReviewSage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/docs/github-auth">
            <Button variant="ghost" size="sm" className="gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              <BookOpen className="h-4 w-4" /> Como gerar tokens
            </Button>
          </Link>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Plus className="h-4 w-4" /> Adicionar projeto
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--card)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <h2 className="font-semibold mb-5">Novo projeto</h2>
          <form onSubmit={handleCreate} className="space-y-5">

            {/* Name + repo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome do projeto</label>
                <Input placeholder="API Core" value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">GitHub Owner</label>
                <Input placeholder="minha-empresa" value={form.githubOwner} onChange={set("githubOwner")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Repositório</label>
                <Input placeholder="api-core" value={form.githubRepo} onChange={set("githubRepo")} required />
              </div>
            </div>

            {/* Auth method selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Método de autenticação</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["PAT", "GITHUB_APP"] as AuthType[]).map((type) => {
                  const cfg = authMethodConfig[type];
                  const Icon = cfg.icon;
                  const selected = form.authType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, authType: type }))}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? cfg.bg : "rgba(255,255,255,0.02)",
                        border: selected ? `1px solid ${cfg.color}50` : "1px solid var(--border)",
                      }}
                    >
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                        <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cfg.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {type === "PAT"
                            ? "Comentários postados como sua conta GitHub pessoal"
                            : "Comentários postados como bot — identidade separada, recomendado para times"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Link href="/docs/github-auth" className="inline-flex items-center gap-1 text-xs mt-2" style={{ color: "#a78bfa" }}>
                <BookOpen className="h-3 w-3" /> Ver como configurar cada método
              </Link>
            </div>

            {/* PAT fields */}
            {form.authType === "PAT" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Personal Access Token (PAT)
                  <span className="ml-2 font-normal text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Scopes: <code>repo</code> (privado) ou <code>public_repo</code> (público)
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type={showPAT ? "text" : "password"}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={form.githubToken}
                    onChange={set("githubToken")}
                    className="pr-20 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPAT((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPAT ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
            )}

            {/* GitHub App fields */}
            {form.authType === "GITHUB_APP" && (
              <div className="space-y-4 rounded-xl p-4" style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">App ID</label>
                    <Input placeholder="123456" value={form.githubAppId} onChange={set("githubAppId")} required />
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      Settings → GitHub Apps → seu App → General → App ID
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Installation ID</label>
                    <Input placeholder="12345678" value={form.githubInstallationId} onChange={set("githubInstallationId")} required />
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      URL ao instalar o App: /installations/<strong>ID</strong>
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium">
                      Private Key <span className="font-normal text-xs" style={{ color: "var(--muted-foreground)" }}>(conteúdo completo do .pem)</span>
                    </label>
                    <button type="button" onClick={() => setShowPEM((v) => !v)} className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {showPEM ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {showPEM ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {showPEM ? (
                    <textarea
                      rows={6}
                      placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"}
                      value={form.githubAppPrivateKey}
                      onChange={set("githubAppPrivateKey")}
                      required
                      className="w-full rounded-lg px-3 py-2 text-xs font-mono resize-none"
                      style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "#a78bfa", outline: "none" }}
                    />
                  ) : (
                    <div
                      className="rounded-lg px-3 py-2 text-xs cursor-pointer"
                      onClick={() => setShowPEM(true)}
                      style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                    >
                      {form.githubAppPrivateKey ? "● ".repeat(8) + " (clique para editar)" : "Clique para inserir a chave privada"}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar projeto
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
          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>Adicione seu primeiro repositório para começar.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Plus className="h-4 w-4" /> Adicionar projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusCfg = syncStatusConfig[project.syncStatus as keyof typeof syncStatusConfig] ?? syncStatusConfig.IDLE;
            const authCfg   = authMethodConfig[project.authType] ?? authMethodConfig.PAT;
            const StatusIcon = statusCfg.icon;
            const AuthIcon   = authCfg.icon;
            return (
              <div key={project.id} className="rounded-xl p-5 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                    <Github className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="flex items-center gap-1" style={{ background: authCfg.bg, color: authCfg.color, border: "none", fontSize: "10px" }}>
                      <AuthIcon className="h-3 w-3" />
                      {authCfg.label}
                    </Badge>
                    <Badge className="flex items-center gap-1" style={{ background: statusCfg.bg, color: statusCfg.color, border: "none", fontSize: "10px" }}>
                      <StatusIcon className={`h-3 w-3 ${project.syncStatus === "SYNCING" ? "animate-spin" : ""}`} />
                      {statusCfg.label}
                    </Badge>
                  </div>
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
                  {syncing === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
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
