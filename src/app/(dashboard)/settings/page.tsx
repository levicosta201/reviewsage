"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain, Cpu, CheckCircle2, XCircle, Loader2, Save,
  Zap, Eye, EyeOff, ChevronDown, KeyRound, Sparkles,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AIProvider = "ANTHROPIC" | "OPENAI" | "OLLAMA";

type Settings = {
  provider: AIProvider;
  // Anthropic
  anthropicApiKey: string;
  anthropicApiKeySet: boolean;
  anthropicApiKeyHint: string | null;
  anthropicModel: string;
  // OpenAI
  openaiApiKey: string;
  openaiApiKeySet: boolean;
  openaiApiKeyHint: string | null;
  openaiModel: string;
  // Ollama
  ollamaBaseUrl: string;
  ollamaModel: string;
};

type TestResult = { ok: boolean; latency: number; models?: string[]; error?: string };
type OllamaDetect = { available: boolean; baseUrl: string; latency?: number; models: string[] } | null;

const ANTHROPIC_MODELS = [
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5  — rápido, econômico" },
  { value: "claude-sonnet-4-6",         label: "Claude Sonnet 4.6 — equilibrado (recomendado)" },
  { value: "claude-opus-4-7",           label: "Claude Opus 4.7   — mais poderoso" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o-mini",   label: "GPT-4o mini  — rápido, barato" },
  { value: "gpt-4o",        label: "GPT-4o       — equilibrado (recomendado)" },
  { value: "gpt-4-turbo",   label: "GPT-4 Turbo  — mais poderoso" },
  { value: "gpt-4.1-mini",  label: "GPT-4.1 mini — mais recente" },
];

const OLLAMA_POPULAR = [
  "llama3.2", "llama3.1", "mistral", "codellama",
  "deepseek-coder-v2", "qwen2.5-coder", "gemma2",
];

const defaults: Settings = {
  provider: "ANTHROPIC",
  anthropicApiKey: "", anthropicApiKeySet: false, anthropicApiKeyHint: null,
  anthropicModel: "claude-haiku-4-5-20251001",
  openaiApiKey: "", openaiApiKeySet: false, openaiApiKeyHint: null,
  openaiModel: "gpt-4o-mini",
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",
};

const providerMeta = {
  ANTHROPIC: { label: "Anthropic Claude", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: Brain },
  OPENAI:    { label: "OpenAI",           color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: Sparkles },
  OLLAMA:    { label: "Ollama (local)",   color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: Cpu },
};

function ApiKeyField({
  label, placeholder, prefix, isSet, hint, value, onChange, onClear,
}: {
  label: string; placeholder: string; prefix: string;
  isSet: boolean; hint: string | null;
  value: string; onChange: (v: string) => void; onClear: () => void;
}) {
  const [show, setShow] = useState(false);
  const [clearing, setClearing] = useState(false);

  if (isSet && !clearing) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} /> {label}
        </label>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#34d399" }} />
          <span className="text-sm font-mono flex-1" style={{ color: "var(--muted-foreground)" }}>
            {hint ?? "Chave configurada"}
          </span>
          <button onClick={() => setClearing(true)} className="text-xs px-2 py-1 rounded" style={{ color: "#f87171", background: "rgba(248,113,113,0.1)" }}>
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} /> {label}
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={clearing ? `Nova chave ${prefix}... (vazio para remover)` : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 font-mono text-sm"
        />
        <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2">
          {show ? <EyeOff className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                : <Eye    className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />}
        </button>
      </div>
      {clearing && (
        <button onClick={() => { setClearing(false); onClear(); }} className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          ← Cancelar remoção
        </button>
      )}
      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
        Armazenada no banco de dados da sua organização.
      </p>
    </div>
  );
}

function ModelRadio({ models, value, onChange }: { models: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {models.map((m) => (
        <button key={m.value} onClick={() => onChange(m.value)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{
            background: value === m.value ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
            border:     value === m.value ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
          }}
        >
          <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: value === m.value ? "#a78bfa" : "var(--border)" }}>
            {value === m.value && <div className="h-2 w-2 rounded-full" style={{ background: "#a78bfa" }} />}
          </div>
          <span className="text-sm font-mono">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved]       = useState<Settings>(defaults);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [ollamaDetect, setOllamaDetect] = useState<OllamaDetect>(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [ollamaModelInput, setOllamaModelInput] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const detectOllama = useCallback(async () => {
    setDetectLoading(true);
    try {
      const res = await fetch("/api/settings/ai/detect");
      const data = await res.json();
      setOllamaDetect(data);
    } catch {
      setOllamaDetect({ available: false, baseUrl: "", models: [] });
    } finally {
      setDetectLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/settings/ai")
      .then((r) => r.json())
      .then((data) => {
        const s: Settings = {
          provider: data.provider ?? "ANTHROPIC",
          anthropicApiKey: "", anthropicApiKeySet: data.anthropicApiKeySet ?? false, anthropicApiKeyHint: data.anthropicApiKeyHint ?? null,
          anthropicModel: data.anthropicModel ?? defaults.anthropicModel,
          openaiApiKey: "", openaiApiKeySet: data.openaiApiKeySet ?? false, openaiApiKeyHint: data.openaiApiKeyHint ?? null,
          openaiModel: data.openaiModel ?? defaults.openaiModel,
          ollamaBaseUrl: data.ollamaBaseUrl ?? defaults.ollamaBaseUrl,
          ollamaModel: data.ollamaModel ?? defaults.ollamaModel,
        };
        setSettings(s);
        setSaved(s);
        setOllamaModelInput(s.ollamaModel);
      })
      .finally(() => setLoading(false));

    detectOllama();
  }, [detectOllama]);

  const isDirty =
    settings.provider !== saved.provider ||
    settings.anthropicModel !== saved.anthropicModel ||
    settings.openaiModel !== saved.openaiModel ||
    settings.ollamaBaseUrl !== saved.ollamaBaseUrl ||
    settings.ollamaModel !== saved.ollamaModel ||
    settings.anthropicApiKey !== "" ||
    settings.openaiApiKey !== "";

  async function handleSave() {
    setSaving(true);
    setTestResult(null);
    try {
      const body: Record<string, string | undefined> = {
        provider: settings.provider,
        anthropicModel: settings.anthropicModel,
        openaiModel: settings.openaiModel,
        ollamaBaseUrl: settings.ollamaBaseUrl,
        ollamaModel: settings.ollamaModel,
      };
      if (settings.anthropicApiKey !== "") body.anthropicApiKey = settings.anthropicApiKey;
      if (settings.openaiApiKey !== "")    body.openaiApiKey    = settings.openaiApiKey;

      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((s) => ({
          ...s,
          anthropicApiKey: "", anthropicApiKeySet: data.anthropicApiKeySet, anthropicApiKeyHint: data.anthropicApiKeyHint,
          openaiApiKey: "",    openaiApiKeySet: data.openaiApiKeySet,    openaiApiKeyHint: data.openaiApiKeyHint,
        }));
        setSaved((s) => ({ ...s, anthropicApiKey: "", openaiApiKey: "" }));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.provider,
          anthropicModel: settings.anthropicModel,
          anthropicApiKey: settings.anthropicApiKey || undefined,
          openaiModel: settings.openaiModel,
          openaiApiKey: settings.openaiApiKey || undefined,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          ollamaModel: settings.ollamaModel,
        }),
      });
      setTestResult(await res.json());
    } finally {
      setTesting(false);
    }
  }

  function switchToOllama() {
    if (!ollamaDetect) return;
    setSettings((s) => ({
      ...s,
      provider: "OLLAMA",
      ollamaBaseUrl: ollamaDetect.baseUrl,
      ollamaModel: ollamaDetect.models[0] ?? s.ollamaModel,
    }));
    setOllamaModelInput(ollamaDetect.models[0] ?? settings.ollamaModel);
    setTestResult(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Configure o modelo de IA usado para analisar os pull requests.
        </p>
      </div>

      {/* Ollama auto-detect banner */}
      {settings.provider !== "OLLAMA" && (
        <div className="mb-4 rounded-xl p-4 flex items-center gap-3"
          style={{
            background: ollamaDetect?.available ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.02)",
            border: ollamaDetect?.available ? "1px solid rgba(251,191,36,0.25)" : "1px solid var(--border)",
          }}
        >
          <Cpu className="h-4 w-4 flex-shrink-0" style={{ color: ollamaDetect?.available ? "#fbbf24" : "var(--muted-foreground)" }} />
          <div className="flex-1 min-w-0">
            {detectLoading ? (
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Detectando Ollama...</p>
            ) : ollamaDetect?.available ? (
              <>
                <p className="text-sm font-medium" style={{ color: "#fbbf24" }}>
                  Ollama detectado — {ollamaDetect.latency}ms
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {ollamaDetect.models.length > 0
                    ? `${ollamaDetect.models.length} modelo(s): ${ollamaDetect.models.slice(0, 3).join(", ")}${ollamaDetect.models.length > 3 ? "..." : ""}`
                    : "Nenhum modelo instalado ainda"}
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Ollama não detectado em <code>{ollamaDetect?.baseUrl ?? "localhost:11434"}</code>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={detectOllama} className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5" title="Verificar novamente">
              <RefreshCw className={`h-3.5 w-3.5 ${detectLoading ? "animate-spin" : ""}`} style={{ color: "var(--muted-foreground)" }} />
            </button>
            {ollamaDetect?.available && (
              <Button size="sm" onClick={switchToOllama} style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                Usar Ollama
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Provider selector + config */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1">Provedor de IA</h2>
        <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>
          Escolha entre Anthropic Claude, OpenAI ou um modelo local via Ollama.
        </p>

        {/* Provider cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(["ANTHROPIC", "OPENAI", "OLLAMA"] as AIProvider[]).map((p) => {
            const meta = providerMeta[p];
            const Icon = meta.icon;
            const selected = settings.provider === p;
            return (
              <button key={p} onClick={() => { setSettings((s) => ({ ...s, provider: p })); setTestResult(null); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                style={{
                  background: selected ? meta.bg : "rgba(255,255,255,0.02)",
                  border: selected ? `1px solid ${meta.color}50` : "1px solid var(--border)",
                }}
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: meta.bg }}>
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <span className="text-xs font-medium text-center">{meta.label}</span>
                {p === "OLLAMA" && ollamaDetect?.available && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                    online
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Anthropic config */}
        {settings.provider === "ANTHROPIC" && (
          <div className="space-y-5">
            <ApiKeyField
              label="Chave da API Anthropic"
              placeholder="sk-ant-api03-..."
              prefix="sk-ant-"
              isSet={settings.anthropicApiKeySet}
              hint={settings.anthropicApiKeyHint}
              value={settings.anthropicApiKey}
              onChange={(v) => setSettings((s) => ({ ...s, anthropicApiKey: v }))}
              onClear={() => setSettings((s) => ({ ...s, anthropicApiKey: "", anthropicApiKeySet: false, anthropicApiKeyHint: null }))}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Modelo</label>
              <ModelRadio models={ANTHROPIC_MODELS} value={settings.anthropicModel}
                onChange={(v) => setSettings((s) => ({ ...s, anthropicModel: v }))} />
            </div>
          </div>
        )}

        {/* OpenAI config */}
        {settings.provider === "OPENAI" && (
          <div className="space-y-5">
            <ApiKeyField
              label="Chave da API OpenAI"
              placeholder="sk-proj-..."
              prefix="sk-"
              isSet={settings.openaiApiKeySet}
              hint={settings.openaiApiKeyHint}
              value={settings.openaiApiKey}
              onChange={(v) => setSettings((s) => ({ ...s, openaiApiKey: v }))}
              onClear={() => setSettings((s) => ({ ...s, openaiApiKey: "", openaiApiKeySet: false, openaiApiKeyHint: null }))}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Modelo</label>
              <ModelRadio models={OPENAI_MODELS} value={settings.openaiModel}
                onChange={(v) => setSettings((s) => ({ ...s, openaiModel: v }))} />
            </div>
          </div>
        )}

        {/* Ollama config */}
        {settings.provider === "OLLAMA" && (
          <div className="space-y-4">
            {ollamaDetect?.available && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
                <span className="text-xs" style={{ color: "#fbbf24" }}>
                  Conectado em {ollamaDetect.baseUrl} — {ollamaDetect.latency}ms
                </span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">URL do servidor Ollama</label>
              <Input value={settings.ollamaBaseUrl}
                onChange={(e) => setSettings((s) => ({ ...s, ollamaBaseUrl: e.target.value }))}
                placeholder="http://localhost:11434" className="font-mono text-sm" />
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Em Docker: <code>http://ollama:11434</code> &nbsp;|&nbsp; Local: <code>http://localhost:11434</code>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Modelo</label>
              <div className="flex gap-2 relative">
                <Input value={ollamaModelInput}
                  onChange={(e) => { setOllamaModelInput(e.target.value); setSettings((s) => ({ ...s, ollamaModel: e.target.value })); }}
                  onFocus={() => setShowModelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowModelDropdown(false), 150)}
                  placeholder="llama3.2" className="font-mono text-sm flex-1" />
                <button onClick={() => setShowModelDropdown((v) => !v)}
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ border: "1px solid var(--border)" }}>
                  <ChevronDown className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-10 mt-1 rounded-xl overflow-hidden z-10"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    {ollamaDetect?.models && ollamaDetect.models.length > 0 && (
                      <>
                        <p className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                          Instalados
                        </p>
                        {ollamaDetect.models.map((m) => (
                          <button key={m} onMouseDown={() => { setOllamaModelInput(m); setSettings((s) => ({ ...s, ollamaModel: m })); setShowModelDropdown(false); }}
                            className="w-full text-left px-3 py-2 text-sm font-mono transition-colors hover:bg-white/5 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0" style={{ color: "#34d399" }} /> {m}
                          </button>
                        ))}
                        <div style={{ borderTop: "1px solid var(--border)" }} />
                      </>
                    )}
                    <p className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                      Populares
                    </p>
                    {OLLAMA_POPULAR.filter((m) => !ollamaDetect?.models?.includes(m)).map((m) => (
                      <button key={m} onMouseDown={() => { setOllamaModelInput(m); setSettings((s) => ({ ...s, ollamaModel: m })); setShowModelDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-mono transition-colors hover:bg-white/5">
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Baixe com: <code>ollama pull {settings.ollamaModel}</code> &nbsp;ou&nbsp; <code>make ollama-pull</code>
              </p>
            </div>
            {!ollamaDetect?.available && (
              <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "#fbbf24" }}>Ollama não detectado</p>
                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Instale em <strong>ollama.com</strong> ou suba via Docker:
                </p>
                <code className="block text-xs px-3 py-2 rounded-lg" style={{ background: "#0a0a12", color: "#a78bfa" }}>
                  make infra-up &amp;&amp; make ollama-pull
                </code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-2" style={{ borderColor: "var(--border)" }}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Testar conexão
        </Button>
        <Button onClick={handleSave} disabled={saving || !isDirty} className="gap-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", opacity: !isDirty ? 0.5 : 1 }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>

      {/* Test result */}
      {testResult && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: testResult.ok ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
            border: `1px solid ${testResult.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
          }}
        >
          {testResult.ok
            ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />
            : <XCircle      className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />}
          <div className="flex-1 min-w-0">
            {testResult.ok ? (
              <>
                <p className="text-sm font-medium" style={{ color: "#34d399" }}>Conexão OK — {testResult.latency}ms</p>
                {testResult.models && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Modelos: {testResult.models.slice(0, 5).join(", ")}{testResult.models.length > 5 ? ` +${testResult.models.length - 5}` : ""}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium" style={{ color: "#f87171" }}>Falha na conexão</p>
                {testResult.error && <p className="text-xs mt-1 break-all" style={{ color: "var(--muted-foreground)" }}>{testResult.error}</p>}
                {testResult.models && testResult.models.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Modelos instalados: {testResult.models.join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Env var fallback note */}
      {(settings.provider === "ANTHROPIC" && !settings.anthropicApiKeySet) ||
       (settings.provider === "OPENAI"    && !settings.openaiApiKeySet) ? (
        <div className="mt-4 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma chave salva no banco. O sistema tentará usar{" "}
            <code>{settings.provider === "ANTHROPIC" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"}</code>
            {" "}do arquivo <code>.env</code> como alternativa.
          </p>
        </div>
      ) : null}
    </div>
  );
}
