"use client";

import { useState } from "react";
import { GitPullRequest, Loader2, Sparkles, AlertTriangle, Info, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ReviewComment = {
  filePath?: string;
  lineNumber?: number;
  body: string;
  severity: "CRITICAL" | "WARNING" | "SUGGESTION" | "INFO";
};

type ReviewResult = {
  prTitle: string;
  prNumber: number;
  commentsPosted: number;
  tokensUsed: number;
  comments: ReviewComment[];
};

const severityConfig = {
  CRITICAL: { color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", icon: XCircle, label: "Crítico" },
  WARNING: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", icon: AlertTriangle, label: "Aviso" },
  SUGGESTION: { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)", icon: Sparkles, label: "Sugestão" },
  INFO: { color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", icon: Info, label: "Info" },
};

export default function ReviewPage() {
  const [prUrl, setPrUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState("");

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!prUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, projectId: projectId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar review");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const commentsBySeverity = result
    ? {
        CRITICAL: result.comments.filter((c) => c.severity === "CRITICAL"),
        WARNING: result.comments.filter((c) => c.severity === "WARNING"),
        SUGGESTION: result.comments.filter((c) => c.severity === "SUGGESTION"),
        INFO: result.comments.filter((c) => c.severity === "INFO"),
      }
    : null;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Revisar Pull Request</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Cole a URL do PR para gerar uma revisão baseada no histórico do projeto.
        </p>
      </div>

      {/* Input form */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <form onSubmit={handleReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">URL do Pull Request</label>
            <Input
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", color: "var(--muted-foreground)" }}
            >
              <Zap className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
              <span>O review usa o histórico vetorial do projeto para gerar comentários contextuais e precisos.</span>
            </div>
            <Button
              type="submit"
              disabled={loading || !prUrl.trim()}
              className="gap-2 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <GitPullRequest className="h-4 w-4" />
                  Revisar PR
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: "#a78bfa" }} />
          <p className="font-medium mb-1">Analisando o PR...</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Buscando padrões históricos e gerando comentários contextuais
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-lg">{result.prTitle}</h2>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>PR #{result.prNumber}</p>
              </div>
              <Badge style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Review completo
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(["CRITICAL", "WARNING", "SUGGESTION", "INFO"] as const).map((sev) => {
                const cfg = severityConfig[sev];
                const count = commentsBySeverity![sev].length;
                return (
                  <div key={sev} className="rounded-xl p-3 text-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div className="text-2xl font-bold mb-0.5" style={{ color: cfg.color }}>{count}</div>
                    <div className="text-xs" style={{ color: cfg.color }}>{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
                {result.tokensUsed.toLocaleString("pt-BR")} tokens usados
              </span>
              <span>{result.commentsPosted} comentários postados no GitHub</span>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="font-semibold">Comentários gerados</h3>
            {result.comments.map((comment, i) => {
              const cfg = severityConfig[comment.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: "var(--card)", border: `1px solid var(--border)` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {comment.filePath && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8" }}>
                            {comment.filePath}{comment.lineNumber ? `:${comment.lineNumber}` : ""}
                          </span>
                        )}
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
