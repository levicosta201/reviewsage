"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, orgName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar conta");
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">ReviewSage</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Criar conta grátis</h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Comece a revisar PRs com IA hoje mesmo
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            variant="outline"
            className="w-full gap-2 mb-6"
            style={{ borderColor: "rgba(255,255,255,0.1)", height: "44px" }}
          >
            <Github className="h-4 w-4" />
            Continuar com GitHub
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>ou preencha os dados</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Seu nome</label>
              <Input placeholder="João Silva" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome da empresa / organização</label>
              <Input placeholder="Minha Empresa" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Senha</label>
              <Input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", height: "44px" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta grátis"}
            </Button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
            Ao criar uma conta você concorda com os{" "}
            <Link href="/terms" style={{ color: "#a78bfa" }}>Termos</Link> e{" "}
            <Link href="/privacy" style={{ color: "#a78bfa" }}>Política de Privacidade</Link>.
          </p>

          <p className="text-center text-sm mt-4" style={{ color: "var(--muted-foreground)" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#a78bfa" }} className="font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
