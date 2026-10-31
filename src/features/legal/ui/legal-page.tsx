import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: Array<{ title: string; body: ReactNode }>;
}

export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line">
        <div className="ds-container flex h-16 items-center justify-between">
          <Link to="/" aria-label="DevRats — início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="ds-container max-w-3xl py-10 sm:py-14">
        <p className="ds-label">Documento</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
          Atualizado em {updatedAt}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-muted">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold">{section.title}</h2>
              <div className="space-y-2 text-[13px] leading-relaxed text-muted">{section.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-line bg-card p-4 text-[12px] leading-relaxed text-muted">
          Este documento descreve o MVP em piloto do DevRats e pode ser atualizado antes do lançamento
          comercial. Dúvidas sobre dados pessoais podem ser enviadas para{' '}
          <a href="mailto:contato@devrats.app" className="text-accent hover:underline">
            contato@devrats.app
          </a>
          .
        </div>
      </main>
    </div>
  );
}
