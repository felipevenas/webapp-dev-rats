import { LogoMark } from '@/components/brand/logo';

export function SplashScreen({ message = 'Carregando…' }: { message?: string }) {
  return (
    <div className="ds-grid-bg flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg">
      <div className="animate-pulse">
        <LogoMark className="size-12" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">{message}</p>
    </div>
  );
}
