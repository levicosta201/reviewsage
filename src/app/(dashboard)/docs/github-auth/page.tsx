import Link from "next/link";
import { Key, Bot, CheckCircle2, ExternalLink, AlertTriangle, Info, ChevronRight } from "lucide-react";

const sections = [
  { id: "overview",    label: "Visão geral" },
  { id: "pat",         label: "Token Pessoal (PAT)" },
  { id: "github-app",  label: "GitHub App" },
  { id: "comparison",  label: "Comparação" },
  { id: "faq",         label: "FAQ" },
];

export default function GitHubAuthDocsPage() {
  return (
    <div className="flex min-h-full">
      {/* Sidebar de tópicos */}
      <aside className="hidden lg:block w-56 flex-shrink-0 p-6 sticky top-0 self-start" style={{ borderRight: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
          Nesta página
        </p>
        <nav className="space-y-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors hover:text-white"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              {s.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Links úteis</p>
          <div className="space-y-2">
            {[
              { label: "GitHub Settings",     href: "https://github.com/settings/tokens" },
              { label: "GitHub Apps",          href: "https://github.com/settings/apps" },
              { label: "Octokit Auth App",     href: "https://github.com/octokit/auth-app.js" },
            ].map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
                style={{ color: "var(--muted-foreground)" }}>
                <ExternalLink className="h-3 w-3" /> {l.label}
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 p-8 max-w-3xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
          <Link href="/projects" className="hover:text-white transition-colors">Projetos</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span style={{ color: "var(--foreground)" }}>Autenticação GitHub</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Autenticação GitHub</h1>
        <p className="text-lg mb-10" style={{ color: "var(--muted-foreground)" }}>
          Como configurar o acesso ao GitHub para o ReviewSage ler histórico de PRs e postar comentários.
        </p>

        {/* ── OVERVIEW ─────────────────────────────────── */}
        <section id="overview" className="mb-12">
          <h2 className="text-xl font-bold mb-4">Visão geral</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
            O ReviewSage precisa de acesso à API do GitHub para duas operações:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { icon: "📥", title: "Leitura de histórico", desc: "Buscar PRs fechados e seus comentários de review para criar a base vetorial." },
              { icon: "💬", title: "Postagem de comentários", desc: "Postar os comentários gerados pela IA diretamente no Pull Request." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Você pode usar um <strong style={{ color: "var(--foreground)" }}>Personal Access Token (PAT)</strong> ou
            um <strong style={{ color: "var(--foreground)" }}>GitHub App</strong>. A diferença principal é
            a <em>identidade</em> que aparece nos comentários.
          </p>
        </section>

        {/* ── PAT ─────────────────────────────────────── */}
        <section id="pat" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.15)" }}>
              <Key className="h-5 w-5" style={{ color: "#818cf8" }} />
            </div>
            <h2 className="text-xl font-bold">Personal Access Token (PAT)</h2>
          </div>

          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Com PAT, os comentários aparecem como se fossem postados por <strong style={{ color: "var(--foreground)" }}>você</strong> no GitHub.
              Ideal para uso pessoal. Para times, prefira o GitHub App.
            </p>
          </div>

          <h3 className="font-semibold mb-3">Passo a passo</h3>
          <ol className="space-y-5">
            {[
              {
                step: 1,
                title: "Acesse as configurações de tokens",
                content: (
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Vá em <strong>GitHub → Settings → Developer Settings → Personal access tokens → Tokens (classic)</strong> e clique em{" "}
                    <strong>Generate new token (classic)</strong>.{" "}
                    <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: "#818cf8" }}>
                      Abrir direto <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                ),
              },
              {
                step: 2,
                title: "Configure o token",
                content: (
                  <div className="text-sm space-y-2">
                    <p style={{ color: "var(--muted-foreground)" }}>Preencha:</p>
                    <ul className="space-y-1.5 ml-4">
                      {[
                        { field: "Note", value: "ReviewSage" },
                        { field: "Expiration", value: "90 days (ou No expiration)" },
                        { field: "Scopes", value: "repo (repositórios privados) ou public_repo (apenas públicos)" },
                      ].map((i) => (
                        <li key={i.field} className="flex gap-2">
                          <span className="font-medium w-24 flex-shrink-0" style={{ color: "var(--foreground)" }}>{i.field}:</span>
                          <span style={{ color: "var(--muted-foreground)" }}>{i.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                step: 3,
                title: "Copie o token gerado",
                content: (
                  <div>
                    <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
                      Após clicar em <strong>Generate token</strong>, o GitHub exibe o token <strong>uma única vez</strong>. Copie imediatamente.
                    </p>
                    <div className="rounded-lg px-4 py-2.5 font-mono text-sm" style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "#818cf8" }}>
                      ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                ),
              },
              {
                step: 4,
                title: "Cole no ReviewSage",
                content: (
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Em <Link href="/projects" style={{ color: "#818cf8" }}>Projetos</Link> → Adicionar projeto → selecione <strong>Token Pessoal</strong> e cole o token no campo correspondente.
                  </p>
                ),
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">{item.title}</p>
                  {item.content}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── GITHUB APP ───────────────────────────────── */}
        <section id="github-app" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
              <Bot className="h-5 w-5" style={{ color: "#34d399" }} />
            </div>
            <h2 className="text-xl font-bold">GitHub App</h2>
          </div>

          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Com GitHub App, os comentários aparecem como <strong style={{ color: "var(--foreground)" }}>seu-app[bot]</strong> — separado da sua identidade pessoal.
              Recomendado para times e ambientes de produção.
            </p>
          </div>

          <h3 className="font-semibold mb-3">O que você vai precisar</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "App ID", desc: "Identificador numérico do App" },
              { label: "Private Key", desc: "Arquivo .pem gerado no App" },
              { label: "Installation ID", desc: "ID da instalação no repo/org" },
            ].map((i) => (
              <div key={i.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <p className="font-semibold text-sm mb-0.5" style={{ color: "#34d399" }}>{i.label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{i.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-3">Passo a passo</h3>
          <ol className="space-y-6">
            {[
              {
                step: 1,
                title: "Crie um GitHub App",
                content: (
                  <div className="text-sm space-y-2" style={{ color: "var(--muted-foreground)" }}>
                    <p>
                      Acesse <strong>GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App</strong>.{" "}
                      <a href="https://github.com/settings/apps/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: "#34d399" }}>
                        Abrir direto <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <ul className="space-y-1.5 ml-4 mt-2">
                      {[
                        { field: "GitHub App name", value: "ReviewSage Bot (ou qualquer nome)" },
                        { field: "Homepage URL", value: "https://seu-dominio.com" },
                        { field: "Webhook", value: "desabilite (Active → desmarcado)" },
                      ].map((i) => (
                        <li key={i.field} className="flex gap-2">
                          <span className="font-medium w-36 flex-shrink-0" style={{ color: "var(--foreground)" }}>{i.field}:</span>
                          <span>{i.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                step: 2,
                title: "Configure as permissões",
                content: (
                  <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <p className="mb-2">Em <strong>Permissions → Repository permissions</strong>:</p>
                    <div className="space-y-1.5 rounded-lg p-3" style={{ background: "#0a0a12", border: "1px solid var(--border)" }}>
                      {[
                        { perm: "Contents",       level: "Read-only",       desc: "para ler o diff" },
                        { perm: "Pull requests",  level: "Read and write",  desc: "para ler PRs e postar comentários" },
                        { perm: "Metadata",       level: "Read-only",       desc: "obrigatório" },
                      ].map((p) => (
                        <div key={p.perm} className="flex items-center justify-between text-xs font-mono">
                          <span style={{ color: "#a78bfa" }}>{p.perm}</span>
                          <span style={{ color: "#34d399" }}>{p.level}</span>
                          <span style={{ color: "var(--muted-foreground)" }}>— {p.desc}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2">Deixe <strong>Where can this GitHub App be installed?</strong> como <strong>Only on this account</strong> (ou Any account para SaaS público).</p>
                  </div>
                ),
              },
              {
                step: 3,
                title: "Anote o App ID e gere a Private Key",
                content: (
                  <div className="text-sm space-y-3" style={{ color: "var(--muted-foreground)" }}>
                    <p>Após criar o App, na página de configurações você verá o <strong style={{ color: "var(--foreground)" }}>App ID</strong> (número).</p>
                    <p>Role até <strong>Private keys</strong> e clique em <strong>Generate a private key</strong>. Um arquivo <code>.pem</code> será baixado.</p>
                    <div className="rounded-lg px-4 py-3 text-xs font-mono" style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "#34d399" }}>
                      <p style={{ color: "var(--muted-foreground)" }}># Conteúdo do arquivo .pem que você vai colar no ReviewSage:</p>
                      <p>-----BEGIN RSA PRIVATE KEY-----</p>
                      <p>MIIEowIBAAKCAQEA2a2rwplBQLzHPZe5ToyvpBZp9...</p>
                      <p>...</p>
                      <p>-----END RSA PRIVATE KEY-----</p>
                    </div>
                  </div>
                ),
              },
              {
                step: 4,
                title: "Instale o App no repositório",
                content: (
                  <div className="text-sm space-y-2" style={{ color: "var(--muted-foreground)" }}>
                    <p>Na página do App, clique em <strong>Install App</strong> → selecione sua conta ou organização → escolha os repositórios que o ReviewSage vai acessar.</p>
                    <p>Após instalar, a URL da página muda para algo como:</p>
                    <div className="rounded-lg px-4 py-2.5 font-mono text-sm" style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "#818cf8" }}>
                      github.com/settings/installations/<strong style={{ color: "#fbbf24" }}>12345678</strong>
                    </div>
                    <p>O número destacado é o <strong style={{ color: "var(--foreground)" }}>Installation ID</strong>.</p>
                  </div>
                ),
              },
              {
                step: 5,
                title: "Cole tudo no ReviewSage",
                content: (
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Em <Link href="/projects" style={{ color: "#34d399" }}>Projetos</Link> → Adicionar projeto → selecione <strong>GitHub App</strong> e preencha App ID, Installation ID e o conteúdo completo do arquivo <code>.pem</code>.
                  </p>
                ),
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">{item.title}</p>
                  {item.content}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── COMPARISON ───────────────────────────────── */}
        <section id="comparison" className="mb-12">
          <h2 className="text-xl font-bold mb-4">Comparação</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-5 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Critério</th>
                  <th className="text-left px-5 py-3 font-medium" style={{ color: "#818cf8" }}>Token Pessoal</th>
                  <th className="text-left px-5 py-3 font-medium" style={{ color: "#34d399" }}>GitHub App</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {[
                  { criteria: "Identidade dos comentários", pat: "Sua conta pessoal (@você)", app: "Bot (@seu-app[bot])" },
                  { criteria: "Configuração", pat: "Simples — gera 1 token", app: "Mais passos — App + chave + instalação" },
                  { criteria: "Rate limit", pat: "5.000 req/hora (conta)", app: "5.000 req/hora (por instalação)" },
                  { criteria: "Expiração", pat: "Expira (30/60/90 dias ou nunca)", app: "Não expira (token de instalação renovado automaticamente)" },
                  { criteria: "Indicado para", pat: "Uso pessoal, testes", app: "Times, produção, múltiplos repos" },
                ].map((row) => (
                  <tr key={row.criteria} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-medium">{row.criteria}</td>
                    <td className="px-5 py-3" style={{ color: "var(--muted-foreground)" }}>{row.pat}</td>
                    <td className="px-5 py-3" style={{ color: "var(--muted-foreground)" }}>{row.app}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section id="faq" className="mb-8">
          <h2 className="text-xl font-bold mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Meu token PAT expirou. O que acontece?",
                a: "A sincronização e o review falharão com erro de autenticação. Gere um novo token no GitHub, edite o projeto no ReviewSage e cole o novo valor.",
              },
              {
                q: "A chave privada do GitHub App fica armazenada no banco?",
                a: "Sim, atualmente o campo githubAppPrivateKey é armazenado como texto no PostgreSQL. Para produção, recomendamos usar a variável GITHUB_APP_PRIVATE_KEY no ambiente e referenciar via código, ou criptografar o campo antes de persistir.",
              },
              {
                q: "Posso usar o mesmo GitHub App para múltiplos projetos?",
                a: "Sim. O App ID e a Private Key são os mesmos — o que muda é o Installation ID, que é por conta/org instalada. Cada projeto pode ter seu Installation ID diferente.",
              },
              {
                q: "O bot vai aparecer como autor dos comentários?",
                a: "Sim, com GitHub App os comentários aparecem como `@nome-do-seu-app[bot]` — completamente separado da sua identidade. Com PAT, aparecem com o seu @usuario.",
              },
              {
                q: "Preciso de acesso de admin no repositório para instalar o App?",
                a: "Sim, para instalar o GitHub App você precisa ser admin do repositório ou da organização. Após instalado, qualquer usuário com acesso ao ReviewSage pode usar o projeto.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#a78bfa" }} />
                  <div>
                    <p className="font-semibold text-sm mb-1.5">{item.q}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div>
            <p className="font-semibold text-sm mb-0.5">Pronto para configurar?</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Adicione seu primeiro projeto e sincronize o histórico.</p>
          </div>
          <Link href="/projects">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              Ir para Projetos →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
