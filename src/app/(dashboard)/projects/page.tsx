"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Github, RefreshCw, Loader2, FolderGit2,
  CheckCircle2, AlertCircle, Clock, Key, Bot,
  BookOpen, ChevronDown, ChevronUp, Search, Lock,
  Globe, Star, ArrowLeft, X, ChevronRight, Trash2,
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

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  language: string | null;
  updatedAt: string | null;
  stars: number;
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

const langColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", Ruby: "#701516",
  PHP: "#4F5D95", "C#": "#178600", "C++": "#f34b7d", Swift: "#F05138",
  Kotlin: "#A97BFF", Dart: "#00B4AB",
};

const emptyForm = {
  name: "", githubOwner: "", githubRepo: "",
  authType: "PAT" as AuthType,
  githubToken: "",
  githubAppId: "", githubAppPrivateKey: "", githubInstallationId: "",
};

type Step = "pick-repo" | "configure";

export default function ProjectsPage() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState<string | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [showPAT, setShowPAT]       = useState(false);
  const [showPEM, setShowPEM]       = useState(false);
  const [step, setStep]             = useState<Step>("pick-repo");

  // repo picker state
  const [repos, setRepos]           = useState<GithubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposConnected, setReposConnected] = useState<boolean | null>(null);
  const [search, setSearch]         = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchRepos = useCallback(async (q: string, p: number, append = false) => {
    setReposLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/github/repos?${params}`);
      const data = await res.json();
      setReposConnected(data.connected);
      if (append) {
        setRepos((prev) => [...prev, ...data.repos]);
      } else {
        setRepos(data.repos ?? []);
      }
      setHasMore((data.repos ?? []).length === 50);
    } finally {
      setReposLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showForm) return;
    fetchRepos("", 1);
  }, [showForm, fetchRepos]);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchRepos(val, 1), 400);
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchRepos(search, next, true);
  }

  function handleSelectRepo(repo: GithubRepo) {
    setSelectedRepo(repo);
    setForm((f) => ({
      ...f,
      name: repo.name,
      githubOwner: repo.owner,
      githubRepo: repo.name,
    }));
    setStep("configure");
  }

  function handleBack() {
    setStep("pick-repo");
    setSelectedRepo(null);
  }

  function handleClose() {
    setShowForm(false);
    setStep("pick-repo");
    setSelectedRepo(null);
    setSearch("");
    setForm(emptyForm);
    setShowPAT(false);
    setShowPEM(false);
  }

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
      if (res.ok) { handleClose(); fetchProjects(); }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Excluir "${project.name}"? Todos os embeddings e histórico de reviews serão apagados permanentemente.`)) return;
    setDeleting(project.id);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } finally {
      setDeleting(null);
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
          <Button
            onClick={() => { setShowForm(true); setStep("pick-repo"); }}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <Plus className="h-4 w-4" /> Adicionar projeto
          </Button>
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl flex flex-col"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(124,58,237,0.3)",
              maxHeight: "85vh",
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                {step === "configure" && (
                  <button
                    onClick={handleBack}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                  >
                    <ArrowLeft className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                )}
                <div>
                  <h2 className="font-semibold text-sm">
                    {step === "pick-repo" ? "Escolha um repositório" : "Configurar projeto"}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {step === "pick-repo"
                      ? "Selecione o repositório que deseja monitorar"
                      : `${selectedRepo?.fullName} → configure como o ReviewSage vai autenticar`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-8 rounded-full transition-all"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  />
                  <div
                    className="h-1.5 w-8 rounded-full transition-all"
                    style={{ background: step === "configure" ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "var(--border)" }}
                  />
                </div>
                <button
                  onClick={handleClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                >
                  <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>

            {/* Step 1: Repo picker */}
            {step === "pick-repo" && (
              <div className="flex flex-col min-h-0 flex-1">
                {reposConnected === false ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="h-14 w-14 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                      <Github className="h-7 w-7" style={{ color: "#a78bfa" }} />
                    </div>
                    <h3 className="font-semibold mb-2">Conta GitHub não conectada</h3>
                    <p className="text-sm mb-6 max-w-sm" style={{ color: "var(--muted-foreground)" }}>
                      Faça login com GitHub para listar seus repositórios automaticamente, ou preencha os dados manualmente.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setStep("configure")}
                        variant="outline"
                        className="gap-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        Preencher manualmente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Search */}
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                        <input
                          type="text"
                          placeholder="Buscar repositório..."
                          value={search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-transparent outline-none"
                          style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Repo list */}
                    <div className="overflow-y-auto flex-1" style={{ minHeight: 0 }}>
                      {reposLoading && repos.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                        </div>
                      ) : repos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <FolderGit2 className="h-8 w-8 mb-3" style={{ color: "var(--muted-foreground)" }} />
                          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            Nenhum repositório encontrado
                          </p>
                        </div>
                      ) : (
                        <>
                          {repos.map((repo) => (
                            <button
                              key={repo.id}
                              onClick={() => handleSelectRepo(repo)}
                              className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/5"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <div
                                className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(124,58,237,0.1)" }}
                              >
                                <Github className="h-4 w-4" style={{ color: "#a78bfa" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-medium truncate">{repo.fullName}</span>
                                  {repo.private ? (
                                    <Lock className="h-3 w-3 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                                  ) : (
                                    <Globe className="h-3 w-3 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                                  )}
                                </div>
                                {repo.description && (
                                  <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                                    {repo.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {repo.language && (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ background: langColors[repo.language] ?? "#8b949e" }}
                                    />
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                      {repo.language}
                                    </span>
                                  </div>
                                )}
                                {repo.stars > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" style={{ color: "var(--muted-foreground)" }} />
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                      {repo.stars.toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                )}
                                <ChevronRight className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                              </div>
                            </button>
                          ))}

                          {/* Load more */}
                          {!search && hasMore && (
                            <div className="p-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLoadMore}
                                disabled={reposLoading}
                                className="gap-2"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                {reposLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                Carregar mais
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer: manual entry */}
                    <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                      <button
                        onClick={() => setStep("configure")}
                        className="text-xs transition-colors hover:text-white"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Não encontrou? Preencher dados manualmente →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Configure */}
            {step === "configure" && (
              <div className="overflow-y-auto flex-1 px-6 py-5">
                <form onSubmit={handleCreate} className="space-y-5">
                  {/* Selected repo banner OR manual fields */}
                  {selectedRepo ? (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      <Github className="h-4 w-4 flex-shrink-0" style={{ color: "#a78bfa" }} />
                      <span className="text-sm font-medium">{selectedRepo.fullName}</span>
                      {selectedRepo.private ? (
                        <Badge className="ml-auto text-xs" style={{ background: "rgba(107,107,138,0.15)", color: "var(--muted-foreground)", border: "none" }}>
                          <Lock className="h-3 w-3 mr-1" /> Privado
                        </Badge>
                      ) : (
                        <Badge className="ml-auto text-xs" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "none" }}>
                          <Globe className="h-3 w-3 mr-1" /> Público
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">GitHub Owner</label>
                        <Input placeholder="minha-empresa" value={form.githubOwner} onChange={set("githubOwner")} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Repositório</label>
                        <Input placeholder="api-core" value={form.githubRepo} onChange={set("githubRepo")} required />
                      </div>
                    </div>
                  )}

                  {/* Project name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nome do projeto</label>
                    <Input placeholder="API Core" value={form.name} onChange={set("name")} required />
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      Exibido no dashboard — pode ser diferente do nome do repositório.
                    </p>
                  </div>

                  {/* Auth method */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Método de autenticação para comentários</label>
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
                            rows={5}
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
                    <Button type="button" variant="ghost" onClick={handleClose} style={{ color: "var(--muted-foreground)" }}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
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
          <Button
            onClick={() => { setShowForm(true); setStep("pick-repo"); }}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleSync(project.id)}
                    disabled={syncing === project.id || project.syncStatus === "SYNCING"}
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    {syncing === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Sincronizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(project)}
                    disabled={deleting === project.id}
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#f87171" }}
                  >
                    {deleting === project.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
