import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden border-r border-line bg-surface lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:p-10">
        <div className="relative">
          <Link to="/" aria-label="DevRats - página inicial">
            <Logo />
          </Link>
          <div className="mt-14 max-w-sm">
            <p className="ds-label mb-3">Constância verificável</p>
            <h1 className="text-[38px] font-semibold leading-[1.06] tracking-[-0.045em]">
              Constância
              <br />
              que compila<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Um commit válido por dia. Um grupo privado. Ranking, sequência e calendário - sem planilha,
              sem autoengano.
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-between text-[11px] text-faint">
          <span>GitHub verificado · dados privados protegidos</span>
          <Link to="/termos" className="hover:text-muted">
            Termos
          </Link>
        </div>
      </aside>

      <main className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:h-dvh lg:min-h-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" aria-label="DevRats - página inicial">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="absolute right-6 top-5 hidden lg:block">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[420px]">
            <header className="mb-7 space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-fg sm:text-[28px]">{title}</h2>
              <p className="text-sm leading-relaxed text-muted">{subtitle}</p>
            </header>
            {children}
          </div>
        </div>
        <footer className="text-center text-[11px] text-faint">
          {footer ?? (
            <>
              Ao continuar, você concorda com os{' '}
              <Link to="/termos" className="text-muted underline-offset-2 hover:underline">
                Termos
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" className="text-muted underline-offset-2 hover:underline">
                Privacidade
              </Link>
              .
            </>
          )}
        </footer>
      </main>
    </div>
  );
}
