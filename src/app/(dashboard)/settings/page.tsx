"use client";

import { useState, useEffect } from "react";
import {
  Brain, Cpu, CheckCircle2, XCircle, Loader2,
  Save, Zap, AlertCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AIProvider = "ANTHROPIC" | "OLLAMA";

type AISettings = {
  provider: AIProvider;
  anthropicModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
};

type TestResult = {
  ok: boolean;
  latency: number;
  models?: string[];
  error?: string;
};

const ANTHROPIC_MODELS = [
  { value: "claude-haiku-4-5-20251001",  label: "Claude Haiku 4.5  — rápido, barato"          },
  { value: "claude-sonnet-4-6",          label: "Claude Sonnet 4.6 — equilibrado (recomendado)" },
  { value: "claude-opus-4-7",            label: "Claude Opus 4.7   — mais poderoso"             },
];

const OLLAMA_POPULAR = [
  "llama3.2", "llama3.1", "mistral", "codellama",
  "deepseek-coder-v2", "qwen2.5-coder", "gemma2",
];

const defaultSettings: AISettings = {
  provider: "ANTHROPIC",
  anthropicModel: "claude-haiku-4-5-20251001",
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [saved, setSaved]       = useState<AISettings>(defaultSettings);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [ollamaModelInput, setOllamaModelInput] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/settings/ai")
      .then((r) => r.json())
      .then((data) => {
        const s: AISettings = {
          provider: data.provider ?? "ANTHROPIC",
          anthropicModel: data.anthropicModel ?? defaultSettings.anthropicModel,
          ollamaBaseUrl: data.ollamaBaseUrl ?? defaultSettings.ollamaBaseUrl,
          ollamaModel: data.ollamaModel ?? defaultSettings.ollamaModel,
        };
        setSettings(s);
        setSaved(s);
        setOllamaModelInput(s.ollamaModel);
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

  async function handleSave() {
    setSaving(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) setSaved({ ...settings });
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
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setTestResult(data);
    } finally {
      setTesting(false);
    }
  }

  function setProvider(provider: AIProvider) {
    setSettings((s) => ({ ...s, provider }));
    setTestResult(null);
  }

  function selectOllamaModel(model: string) {
    setOllamaModelInput(model);
    setSettings((s) => ({ ...s, ollamaModel: model }));
    setShowModelDropdown(false);
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

      {/* Provider selector */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Brain className="h-4 w-4" style={{ color: "#a78bfa" }} />
          Provedor de IA
        </h2>
        <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>
          Escolha entre a API da Anthropic (Claude) ou um modelo local via Ollama.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Anthropic card */}
          {(["ANTHROPIC", "OLLAMA"] as AIProvider[]).map((p) => {
            const isAnthropic = p === "ANTHROPIC";
            const selected = settings.provider === p;
            const color = isAnthropic ? "#a78bfa" : "#34d399";
            const bg    = isAnthropic ? "rgba(167,139,250,0.1)" : "rgba(52,211,153,0.1)";
            const Icon  = isAnthropic ? Brain : Cpu;
            return (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  background: selected ? bg : "rgba(255,255,255,0.02)",
                  border: selected ? `1px solid ${color}50` : "1px solid var(--border)",
                }}
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="font-medium text-sm">{isAnthropic ? "Anthropic Claude" : "Ollama (local)"}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {isAnthropic ? "API em nuvem — requer ANTHROPIC_API_KEY" : "Roda localmente — gratuito, privado"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Anthropic config */}
        {settings.provider === "ANTHROPIC" && (
          <div>
            <label className="block text-sm font-medium mb-2">Modelo</label>
            <div className="space-y-2">
              {ANTHROPIC_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSettings((s) => ({ ...s, anthropicModel: m.value }))}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: settings.anthropicModel === m.value ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
                    border: settings.anthropicModel === m.value ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
                  }}
                >
                  <div
                    className="h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: settings.anthropicModel === m.value ? "#a78bfa" : "var(--border)" }}
                  >
                    {settings.anthropicModel === m.value && (
                      <div className="h-2 w-2 rounded-full" style={{ background: "#a78bfa" }} />
                    )}
                  </div>
                  <span className="text-sm font-mono">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ollama config */}
        {settings.provider === "OLLAMA" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">URL do servidor Ollama</label>
              <Input
                value={settings.ollamaBaseUrl}
                onChange={(e) => setSettings((s) => ({ ...s, ollamaBaseUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="font-mono text-sm"
              />
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Padrão ao rodar <code>ollama serve</code> localmente.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Modelo</label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={ollamaModelInput}
                      onChange={(e) => {
                        setOllamaModelInput(e.target.value);
                        setSettings((s) => ({ ...s, ollamaModel: e.target.value }));
                      }}
                      onFocus={() => setShowModelDropdown(true)}
                      onBlur={() => setTimeout(() => setShowModelDropdown(false), 150)}
                      placeholder="llama3.2"
                      className="font-mono text-sm"
                    />
                    {showModelDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                      >
                        <p className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                          Modelos populares
                        </p>
                        {OLLAMA_POPULAR.map((m) => (
                          <button
                            key={m}
                            onMouseDown={() => selectOllamaModel(m)}
                            className="w-full text-left px-3 py-2 text-sm font-mono transition-colors hover:bg-white/5"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowModelDropdown((v) => !v)}
                    className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <ChevronDown className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Baixe o modelo com: <code>ollama pull {settings.ollamaModel}</code>
              </p>
            </div>

            {/* Ollama install hint */}
            <div className="rounded-xl p-4" style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#34d399" }}>
                Não tem Ollama instalado?
              </p>
              <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                Instale em <strong>ollama.com</strong> e rode:
              </p>
              <code className="block text-xs px-3 py-2 rounded-lg" style={{ background: "#0a0a12", color: "#a78bfa" }}>
                ollama pull {settings.ollamaModel}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Test + Save */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testing}
          className="gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Testar conexão
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="gap-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", opacity: !isDirty ? 0.5 : 1 }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: testResult.ok ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
            border: `1px solid ${testResult.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
          }}
        >
          {testResult.ok
            ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />
            : <XCircle    className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
          }
          <div className="flex-1 min-w-0">
            {testResult.ok ? (
              <>
                <p className="text-sm font-medium" style={{ color: "#34d399" }}>
                  Conexão OK — {testResult.latency}ms
                </p>
                {testResult.models && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Modelos disponíveis: {testResult.models.slice(0, 5).join(", ")}
                    {testResult.models.length > 5 && ` +${testResult.models.length - 5}`}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium" style={{ color: "#f87171" }}>Falha na conexão</p>
                {testResult.error && (
                  <p className="text-xs mt-1 break-all" style={{ color: "var(--muted-foreground)" }}>
                    {testResult.error}
                  </p>
                )}
                {testResult.models && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Modelos instalados: {testResult.models.join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* API key warning */}
      {settings.provider === "ANTHROPIC" && (
        <div className="mt-4 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            A chave <code>ANTHROPIC_API_KEY</code> é lida do arquivo <code>.env</code> no servidor.
            Edite o arquivo e reinicie o app para atualizar.
          </p>
        </div>
      )}
    </div>
  );
}
