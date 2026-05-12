import Link from "next/link";
import {
  GitPullRequest,
  Zap,
  Brain,
  Users,
  Database,
  Bot,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Check,
  Github,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: TrendingDown,
    title: "90% menos tokens",
    description:
      "O review só roda quando você solicita, não a cada push. Mantemos o histórico e geração contextual sob demanda.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "Memória vetorial",
    description:
      "Lemos todos os comentários históricos de PRs e armazenamos como embeddings. A IA aprende os padrões da sua equipe.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: GitPullRequest,
    title: "Review em 1 clique",
    description:
      "Cole a URL do PR e receba comentários precisos e contextuais postados diretamente no GitHub.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Bot,
    title: "Agent skill exportável",
    description:
      "Exporte o conhecimento acumulado como uma skill para seus agentes de IA revisarem PRs autonomamente.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description:
      "Cada empresa tem seu workspace isolado, projetos separados, e controle granular de acesso por time.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Database,
    title: "Histórico completo",
    description:
      "Todos os reviews gerados ficam registrados. Acompanhe evolução, padrões e métricas do seu processo.",
    color: "from-cyan-500 to-sky-500",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Conecte seu repositório",
    description: "Autorize o acesso ao GitHub e adicione os projetos que deseja monitorar.",
  },
  {
    step: "02",
    title: "Sincronize o histórico",
    description:
      "O ReviewSage lê todos os comentários de PRs antigos, gera embeddings e constrói a base de conhecimento vetorial.",
  },
  {
    step: "03",
    title: "Cole a URL do PR",
    description:
      "Quando quiser revisar um PR, cole a URL. O sistema busca padrões similares no histórico e gera comentários contextuais.",
  },
  {
    step: "04",
    title: "Comentários automáticos",
    description:
      "Os comentários são postados diretamente no PR do GitHub, com severidade e contexto baseados no histórico da equipe.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "para sempre",
    description: "Para times pequenos explorarem o poder do review com IA.",
    features: ["1 projeto", "500 comentários históricos", "10 reviews/mês", "GitHub OAuth", "Histórico 30 dias"],
    cta: "Começar grátis",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "por mês",
    description: "Para times que querem automatizar todo o processo de code review.",
    features: ["10 projetos", "Histórico ilimitado", "Reviews ilimitados", "Agent skill export", "API access", "Webhooks", "Suporte prioritário"],
    cta: "Começar Pro",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "por acordo",
    description: "Para grandes organizações com necessidades específicas de compliance.",
    features: ["Projetos ilimitados", "Self-hosted option", "SSO / SAML", "SLA 99.9%", "Onboarding dedicado", "Custom models"],
    cta: "Falar com vendas",
    href: "/contact",
    highlight: false,
  },
];

const stats = [
  { value: "94%", label: "redução de tokens vs. review on-push" },
  { value: "3.2x", label: "mais comentários relevantes" },
  { value: "< 30s", label: "tempo médio de review" },
  { value: "100%", label: "open source no GitHub" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full glass" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">ReviewSage</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              Open Source
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">Como funciona</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Preços</Link>
            <Link href="https://github.com/reviewsage/reviewsage" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="h-4 w-4" /> GitHub
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Code review com IA que aprende com seu histórico</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Review de código{" "}
            <span className="gradient-text">sob demanda.</span>
            <br />
            Não a cada push.
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            O ReviewSage aprende com o histórico de PRs da sua equipe e gera comentários
            precisos apenas quando você pede —{" "}
            <strong style={{ color: "#a78bfa" }}>economizando 90% dos tokens</strong> em
            comparação com reviews automáticos por push.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                Começar grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/reviewsage/reviewsage">
              <Button variant="outline" size="lg" className="gap-2 px-8" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <Github className="h-4 w-4" /> Ver no GitHub <Star className="h-4 w-4" style={{ color: "#fbbf24" }} />
              </Button>
            </Link>
          </div>

          {/* Token economy callout */}
          <div
            className="mt-16 inline-flex items-start gap-4 rounded-2xl p-6 text-left max-w-2xl mx-auto"
            style={{ background: "rgba(16,16,26,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
              <TrendingDown className="h-5 w-5" style={{ color: "#34d399" }} />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#34d399" }}>Economia real de tokens</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Ferramentas que rodam a cada push gastam tokens continuamente — mesmo em commits de WIP e fixups.
                Com o ReviewSage, o processo só acontece quando você solicita, mantendo o histórico vetorial
                persistente sem recalcular do zero.
              </p>
            </div>
          </div>
        </div>

        {/* Demo preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 80px rgba(124,58,237,0.1)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0a0a14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <div
                className="ml-4 flex-1 rounded px-3 py-1 text-xs font-mono text-center"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--muted-foreground)" }}
              >
                reviewsage.app/review
              </div>
            </div>
            <div className="p-8" style={{ background: "#0d0d14" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>URL do Pull Request</p>
                    <div
                      className="rounded-lg px-3 py-2 text-sm font-mono"
                      style={{ background: "#0a0a12", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
                    >
                      github.com/org/repo/pull/247
                    </div>
                  </div>
                  <div className="rounded-lg p-3 text-xs space-y-2" style={{ background: "#0a0a12", border: "1px solid var(--border)" }}>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-foreground)" }}>Projeto</span>
                      <span className="font-medium">api-core</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-foreground)" }}>Histórico</span>
                      <span className="font-medium" style={{ color: "#34d399" }}>2.847 comentários</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-foreground)" }}>Tokens usados</span>
                      <span className="font-medium" style={{ color: "#fbbf24" }}>~1.200</span>
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-center cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    Revisar PR →
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Comentários gerados (3)</p>
                  {[
                    { file: "src/auth/middleware.ts", line: 42, severity: "WARNING", color: "#fbbf24", body: "Token JWT não está sendo verificado antes do uso. Padrão identificado em 12 PRs anteriores." },
                    { file: "src/api/users.ts", line: 87, severity: "CRITICAL", color: "#f87171", body: "SQL query construída via concatenação de string — vulnerabilidade de SQL injection. Use parameterized queries." },
                    { file: "src/utils/cache.ts", line: 23, severity: "SUGGESTION", color: "#818cf8", body: "Cache key pode causar colisão em cenários multi-tenant. Adicione o tenant ID como prefixo." },
                  ].map((c, i) => (
                    <div key={i} className="rounded-lg p-3 text-xs" style={{ background: "#0a0a12", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono" style={{ color: "#818cf8" }}>{c.file}:{c.line}</span>
                        <span
                          className="rounded px-1.5 py-0.5 font-semibold"
                          style={{ background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}30`, fontSize: "10px" }}
                        >
                          {c.severity}
                        </span>
                      </div>
                      <p style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}>{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.value}>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo que seu time precisa</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Uma plataforma completa para automatizar code reviews com inteligência baseada no histórico real da sua equipe.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-hover rounded-2xl p-6"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "rgba(10,10,18,0.5)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
              Como funciona
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Do zero ao review em minutos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="flex gap-5 p-6 rounded-2xl card-hover"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div
                  className="h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token economy comparison */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                Economia de tokens
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Por que rodar a cada push{" "}
                <span className="gradient-text">desperdiça seu budget de IA</span>
              </h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                <p>
                  Ferramentas de review automático por push enviam o diff completo para a IA em{" "}
                  <strong style={{ color: "var(--foreground)" }}>cada commit</strong> — incluindo commits de WIP, fixups, revert, e ajustes de formatação.
                </p>
                <p>
                  O ReviewSage mantém os embeddings históricos persistentes. Quando você solicita um review, apenas o diff atual é processado e comparado com o banco vetorial já construído — sem recalcular embeddings históricos.
                </p>
                <p>
                  O resultado: o custo de tokens é{" "}
                  <strong style={{ color: "#34d399" }}>linear com o número de reviews</strong>, não com o número de pushes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="font-semibold text-sm" style={{ color: "#f87171" }}>Review automático por push</span>
                </div>
                <div className="space-y-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <div className="flex justify-between"><span>8 pushes/dia × ~2.000 tokens</span><span style={{ color: "#f87171" }}>16.000 tokens/dia</span></div>
                  <div className="flex justify-between"><span>22 dias úteis/mês</span><span style={{ color: "#f87171" }}>~352.000 tokens/mês</span></div>
                  <div className="flex justify-between font-semibold"><span>Custo estimado</span><span style={{ color: "#f87171" }}>~$11/dev/mês</span></div>
                </div>
              </div>
              <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-sm" style={{ color: "#34d399" }}>ReviewSage — sob demanda</span>
                </div>
                <div className="space-y-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <div className="flex justify-between"><span>3 reviews/dia × ~1.200 tokens</span><span style={{ color: "#34d399" }}>3.600 tokens/dia</span></div>
                  <div className="flex justify-between"><span>22 dias úteis/mês</span><span style={{ color: "#34d399" }}>~79.200 tokens/mês</span></div>
                  <div className="flex justify-between font-semibold"><span>Custo estimado (Claude Haiku)</span><span style={{ color: "#34d399" }}>~$0.60/dev/mês</span></div>
                </div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <span className="text-2xl font-bold" style={{ color: "#a78bfa" }}>94% de economia</span>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>com qualidade superior graças ao contexto histórico</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: "rgba(10,10,18,0.5)", borderTop: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
              Preços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simples e transparente</h2>
            <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>Comece grátis. Escale quando precisar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  background: plan.highlight ? "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))" : "var(--card)",
                  border: plan.highlight ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
                  boxShadow: plan.highlight ? "0 0 60px rgba(124,58,237,0.15)" : "none",
                }}
              >
                {plan.highlight && (
                  <div className="text-center mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.4)" }}>
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{plan.period}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: "#34d399" }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    style={plan.highlight ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" } : { borderColor: "rgba(255,255,255,0.1)" }}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="rounded-3xl p-12"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 80px rgba(124,58,237,0.1)" }}
          >
            <Sparkles className="h-12 w-12 mx-auto mb-6" style={{ color: "#a78bfa" }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece a revisar com inteligência hoje</h2>
            <p className="text-lg mb-8" style={{ color: "var(--muted-foreground)" }}>
              Sem cartão de crédito. Configure em menos de 5 minutos. Open source e transparente.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-10" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="lg">Ver documentação</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold">ReviewSage</span>
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>— Open Source</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link href="https://github.com/reviewsage/reviewsage" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="h-4 w-4" /> GitHub
            </Link>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>© 2025 ReviewSage. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}
