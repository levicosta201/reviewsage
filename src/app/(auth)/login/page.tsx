"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email ou senha inválidos.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGitHub() {
    await signIn("github", { callbackUrl: "/dashboard" });
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
          <h1 className="text-2xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Entre na sua conta para continuar
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <Button
            onClick={handleGitHub}
            variant="outline"
            className="w-full gap-2 mb-6"
            style={{ borderColor: "rgba(255,255,255,0.1)", height: "44px" }}
          >
            <Github className="h-4 w-4" />
            Continuar com GitHub
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <form onSubmit={handleCredentials} className="space-y-4">
            {error && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Senha</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: "#a78bfa" }}>
                  Esqueceu?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", height: "44px" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>
            Não tem conta?{" "}
            <Link href="/register" style={{ color: "#a78bfa" }} className="font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
