import { Github } from '@/components/brand/github-icon';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Flame,
  GitBranch,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { Logo } from '@/components/brand/logo';
import { StreakVisual } from '@/components/brand/streak-visual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  MiniCalendar,
  MiniLeaderboard,
  StreakRuleVisual,
  VerificationCard,
} from '@/features/landing/ui/landing-visuals';

const navLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#modos', label: 'Modos' },
  { href: '#regras', label: 'Regras' },
  { href: '#faq', label: 'FAQ' },
];

const steps = [
  {
    number: '01',
    title: 'Conecte o GitHub',
    description:
      'Autorize a GitHub App com permissão de leitura. A identidade é confirmada pelo ID numérico da conta — nunca por nome ou e-mail do commit.',
    icon: Github,
  },
  {
    number: '02',
    title: 'Monte o grupo',
    description:
      'Defina a meta individual de dias válidos, o fuso fixo do desafio e o modo de verificação. Convide amigos por link privado.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Sustente a sequência',
    description:
      'Cada dia com ao menos um commit elegível conta uma vez. O primeiro a alcançar a meta vence — com ranking e calendário ao vivo.',
    icon: Flame,
  },
];

const faqs = [
  {
    question: 'Preciso commitar todos os dias?',
    answer:
      'Sim. Um dia só é válido com pelo menos um commit elegível. Vários commits no mesmo dia continuam valendo um único dia — a competição é de constância, não de volume.',
  },
  {
    question: 'Se eu perder um dia, perco tudo?',
    answer:
      'Não. Dias válidos acumulados nunca são apagados; eles determinam a meta e a vitória. A sequência (streak) zera, mas volta a crescer no próximo dia válido.',
  },
  {
    question: 'Como sei que meu commit foi contado?',
    answer:
      'O calendário mostra cada dia como válido, vazio ou futuro. Eventos podem levar até alguns minutos para processar. Se a integração estiver indisponível, o dia não é tratado como descumprido.',
  },
  {
    question: 'Commit no repositório da empresa conta?',
    answer:
      'No modo de repositórios próprios, não: o repositório precisa pertencer à sua conta pessoal do GitHub. No modo de repositórios selecionados, valem apenas os até três repositórios definidos pelo grupo.',
  },
  {
    question: 'Meu código fica exposto para o grupo?',
    answer:
      'Não. O DevStreak lê apenas metadados necessários para validar o commit: repositório, autoria, data e SHA. Nenhum código-fonte ou mensagem de commit privada é exibida.',
  },
  {
    question: 'Posso mudar a modalidade depois de começar?',
    answer:
      'Não. A modalidade, a meta e a lista de repositórios ficam travadas após o início para garantir as mesmas regras a todos. O criador pode cancelar e criar um novo desafio, preservando o histórico.',
  },
];

export default function LandingPage() {
  const { status } = useAuth();

  return (
    <div className="min-h-dvh bg-bg">
      <header className="ds-glass sticky top-0 z-40">
        <div className="ds-container flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="DevStreak — início" className="inline-flex items-center gap-2.5">
            <Logo />
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
              MVP
            </Badge>
          </Link>

          <nav aria-label="Navegação da landing" className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-[13px] text-muted transition-colors hover:text-fg">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {status === 'authenticated' ? (
              <Button asChild size="sm">
                <Link to="/app">
                  Abrir dashboard
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm" className="hidden whitespace-nowrap sm:inline-flex">
                  <Link to="/register">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="ds-grid-bg ds-radial pointer-events-none absolute inset-0 opacity-80" aria-hidden />
          <div className="ds-container relative grid gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
            <div className="animate-fade-up">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="volt">
                  <span className="size-1.5 rounded-full bg-current" aria-hidden />
                  Grupos privados · em piloto
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  1 commit = 1 dia
                </span>
              </div>

              <h1 className="text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-fg sm:text-6xl lg:text-[68px]">
                Constância
                <br />
                que compila<span className="text-accent">.</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
                Desafie amigos a manter o ritmo. Cada dia com pelo menos um commit elegível vira um dia válido —
                o GitHub verifica, o ranking mostra quem sustenta e o calendário prova.
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Button asChild size="lg">
                  <Link to={status === 'authenticated' ? '/app/groups/new' : '/register'}>
                    {status === 'authenticated' ? 'Criar desafio' : 'Criar meu desafio'}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {['Grátis no piloto', 'Sem acesso de escrita', 'Código nunca exposto'].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-muted">
                    <Check className="size-3.5 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-6 rounded-[32px] bg-volt/5 blur-2xl" aria-hidden />
              <StreakVisual className="relative mx-auto w-full max-w-md" />
              <div className="relative mx-auto mt-3 w-full max-w-md rounded-2xl border border-line bg-card/90 p-4 shadow-2xl backdrop-blur-sm sm:-mt-2 sm:ml-auto sm:mr-0 sm:w-72">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="ds-label">Ranking do grupo</span>
                  <Trophy className="size-3.5 text-gold" aria-hidden />
                </div>
                <MiniLeaderboard />
              </div>
            </div>
          </div>

          <div className="border-y border-line bg-surface/60">
            <div className="ds-container grid grid-cols-2 divide-x divide-line sm:grid-cols-4">
              {[
                ['01', 'commit por dia'],
                ['03', 'repositórios por grupo'],
                ['02', 'modos de verificação'],
                ['00', 'planilhas ou registros manuais'],
              ].map(([value, label]) => (
                <div key={label} className="px-3 py-5 sm:px-5">
                  <p className="font-mono text-2xl text-fg sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="ds-container scroll-mt-20 py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:max-w-2xl">
            <span className="ds-label">Como funciona</span>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Três passos. Nenhum registro manual.
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              A plataforma valida atividade no GitHub e transforma dias elegíveis em progresso, sequência e
              competição saudável.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="ds-card-flat relative overflow-hidden p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-accent">{step.number}</span>
                  <span className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-card-2 text-muted">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface/40">
          <div className="ds-container py-16 sm:py-20">
            <div className="mb-8 flex flex-col gap-3 sm:max-w-2xl">
              <span className="ds-label">Feito para devs</span>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                O painel que prova o que você fez.
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="ds-card-flat p-5 lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <CalendarCheck className="size-4 text-accent" aria-hidden />
                      Calendário honesto
                    </h3>
                    <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">
                      Válido, vazio, futuro, antes do início. O dia não cumprido é diferente de verificação
                      indisponível — e a interface nunca confunde os dois.
                    </p>
                  </div>
                  <Badge variant="volt" size="sm">
                    ao vivo
                  </Badge>
                </div>
                <div className="mt-5 max-w-md">
                  <MiniCalendar />
                </div>
              </article>

              <article className="ds-card-flat p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Trophy className="size-4 text-gold" aria-hidden />
                  Ranking que não engana
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Ordenado por dias válidos. Empate resolve por sequência e atividade elegível mais recente — a
                  vitória é de quem alcança a meta primeiro.
                </p>
                <div className="mt-4">
                  <MiniLeaderboard />
                </div>
              </article>

              <article className="ds-card-flat p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Github className="size-4 text-accent" aria-hidden />
                  Verificação sem drama
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Permissão de leitura, assinatura de webhook validada e reconciliação de eventos perdidos.
                </p>
                <div className="mt-4">
                  <VerificationCard />
                </div>
              </article>

              <article className="ds-card-flat p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Flame className="size-4 text-amber" aria-hidden />
                  Sequência ≠ progresso
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Perder um dia zera a sequência, mas não apaga os dias acumulados. Duas métricas, zero
                  punição desproporcional.
                </p>
                <div className="mt-4">
                  <StreakRuleVisual />
                </div>
              </article>

              <article className="ds-card-flat p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <ShieldCheck className="size-4 text-cyan" aria-hidden />
                  Privacidade por padrão
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Só metadados mínimos são armazenados. Tokens ficam cifrados no backend e nunca chegam ao
                  navegador.
                </p>
                <ul className="mt-4 space-y-2 text-[12px] text-muted">
                  <li className="flex items-center gap-2">
                    <Lock className="size-3.5 text-cyan" aria-hidden /> Sem código-fonte no frontend
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="size-3.5 text-rose" aria-hidden /> Sem permissão de escrita
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-accent" aria-hidden /> Desconexão revoga o uso do token
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="modos" className="ds-container scroll-mt-20 py-16 sm:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:max-w-2xl">
            <span className="ds-label">Dois modos</span>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Escolha o campo de jogo.</h2>
            <p className="text-sm leading-relaxed text-muted">
              O modo é definido na criação e fica travado após o início. Todos os participantes do grupo seguem a
              mesma regra.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="relative overflow-hidden rounded-2xl border border-volt-line bg-card p-6">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-volt/5" aria-hidden />
              <div className="flex items-center justify-between">
                <Badge variant="volt">Recomendado para começar</Badge>
                <GitBranch className="size-4 text-accent" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Repositórios próprios</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Cada participante conta commits nos próprios projetos. Sem compartilhar repositório e sem combinar
                lista prévia.
              </p>
              <ul className="mt-5 space-y-2.5 text-[13px]">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  Vale repositório público ou privado da sua conta
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  Autoria e propriedade verificadas pelo ID do GitHub
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-rose" aria-hidden />
                  Repositório de empresa, de amigo ou de organização não conta
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-line bg-card p-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Para times e turmas</Badge>
                <Users className="size-4 text-muted" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Repositórios selecionados</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                O criador escolhe até três repositórios que valem para todos. Ideal para projetos coletivos e
                desafios de estudo em grupo.
              </p>
              <ul className="mt-5 space-y-2.5 text-[13px]">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  Um, dois ou três repositórios por desafio
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  Lista bloqueada depois do início
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-rose" aria-hidden />
                  Commits fora da lista não geram dias
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section id="regras" className="border-y border-line bg-surface/40">
          <div className="ds-container grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="ds-label">Transparência</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Regras iguais para todo mundo.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Nada de critério implícito. O que conta, o que não conta e como o vencedor é definido fica visível
                antes do desafio começar.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-[11px] text-muted">
                <Sparkles className="size-3.5 text-accent" aria-hidden />
                Fuso do desafio é fixo e armazenado em UTC
              </div>
            </div>

            <div className="divide-y divide-line rounded-2xl border border-line bg-card">
              {[
                {
                  title: 'Dia válido',
                  text: 'Pelo menos um commit elegível no fuso do desafio. Vários commits no mesmo dia contam uma vez.',
                },
                {
                  title: 'Elegibilidade',
                  text: 'Autoria pelo ID numérico do GitHub. Bots, commits vazios e merges não contam. Forks seguem a regra do desafio.',
                },
                {
                  title: 'Vitória',
                  text: 'O primeiro participante a atingir a meta. A conclusão é atômica e o resultado fica congelado.',
                },
                {
                  title: 'Empate',
                  text: 'Se dois participantes completam no mesmo dia, vale o commit elegível mais recente; persistindo, a entrada no grupo.',
                },
                {
                  title: 'Indisponibilidade',
                  text: 'Falha do GitHub não penaliza ninguém. Eventos perdidos são reconciliados e o status fica visível.',
                },
              ].map((rule) => (
                <div key={rule.title} className="flex gap-4 p-4 sm:p-5">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h3 className="text-sm font-medium">{rule.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{rule.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="ds-container scroll-mt-20 py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="ds-label">FAQ</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Perguntas que todo dev faz.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Não encontrou? Fale com a gente antes de criar seu grupo.
              </p>
            </div>
            <div className="divide-y divide-line rounded-2xl border border-line bg-card">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-4 sm:p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {faq.question}
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-line text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-8 text-[13px] leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-container pb-16 sm:pb-20">
          <div className="ds-grid-bg relative overflow-hidden rounded-3xl border border-line bg-card p-8 sm:p-12">
            <div className="ds-radial pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <p className="ds-label">Comece hoje</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Seu próximo commit pode ser o dia 1.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Crie um grupo privado, convide quem vai te cobrar e deixe a constância falar.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/register">
                    Criar conta grátis
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="ds-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-[12px] leading-relaxed text-muted">
              Plataforma social de constância para desenvolvedores. Atividade verificada, não prometida.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              MVP em piloto · 2026
            </p>
          </div>
          <FooterColumn
            title="Produto"
            links={[
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Modos', href: '#modos' },
              { label: 'Regras', href: '#regras' },
              { label: 'FAQ', href: '#faq' },
            ]}
          />
          <FooterColumn
            title="Conta"
            links={[
              { label: 'Entrar', to: '/login' },
              { label: 'Criar conta', to: '/register' },
              { label: 'Recuperar senha', to: '/forgot-password' },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: 'Termos de uso', to: '/termos' },
              { label: 'Privacidade', to: '/privacidade' },
            ]}
          />
        </div>
        <div className="border-t border-line">
          <div className="ds-container flex flex-col gap-2 py-5 text-[11px] text-faint sm:flex-row sm:items-center sm:justify-between">
            <span>DevStreak não é afiliado ao GitHub. Dados tratados conforme a LGPD.</span>
            <span className="font-mono">constancy &gt; intensity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href?: string; to?: string }>;
}) {
  return (
    <div>
      <p className="ds-label mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to} className="text-[12px] text-muted transition-colors hover:text-fg">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="text-[12px] text-muted transition-colors hover:text-fg">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
