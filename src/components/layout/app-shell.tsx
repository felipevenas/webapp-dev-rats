import { Github } from '@/components/brand/github-icon';
import {
  Bell,
  Home,
  LogOut,
  Plus,
  Settings,
  Swords,
  User as UserIcon,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { useUnreadNotifications } from '@/features/notifications/data/use-notifications';
import { cn } from '@/core/lib/cn';
import { Logo } from '@/components/brand/logo';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dot } from '@/components/ui/badge';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import type { IconComponent } from '@/core/types/ui';

const primaryNav = [
  { to: '/app', label: 'Início', icon: Home, end: true },
  { to: '/app/challenges', label: 'Desafios', icon: Swords, end: false },
  { to: '/app/notifications', label: 'Alertas', icon: Bell, end: false },
  { to: '/app/profile', label: 'Perfil', icon: UserIcon, end: false },
];

function navClass(active: boolean) {
  return cn(
    'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    active ? 'bg-volt-soft text-accent' : 'text-muted hover:bg-card-2 hover:text-fg',
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const unread = useUnreadNotifications();
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <div className="mb-7 flex items-center justify-between px-1">
          <Link to="/app" className="inline-flex" aria-label="DevRats — início">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <Button asChild full className="mb-5">
          <Link to="/app/groups/new">
            <Plus aria-hidden />
            Novo desafio
          </Link>
        </Button>

        <nav aria-label="Navegação principal" className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navClass(isActive)}>
              <item.icon className="size-4.5" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.to === '/app/notifications' && unread > 0 ? (
                <span className="rounded-full bg-volt px-1.5 py-0.5 font-mono text-[10px] font-semibold text-volt-ink">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            to="/app/settings/integrations"
            className={cn(
              'block rounded-xl border border-line bg-card p-3 transition-colors hover:border-line-strong',
              location.pathname === '/app/settings/integrations' && 'border-volt-line',
            )}
          >
            <span className="flex items-center gap-2 text-[11px] font-medium text-fg">
              <Github className="size-3.5" aria-hidden />
              Integração GitHub
            </span>
            <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
              <Dot tone={user?.githubConnected ? 'volt' : 'amber'} />
              {user?.githubConnected ? 'Conectada e verificando' : 'Conectar para contar commits'}
            </span>
          </Link>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-2 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={user?.avatarUrl} name={user?.displayName ?? 'Dev'} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-fg">{user?.displayName}</p>
                <p className="truncate font-mono text-[10px] text-faint">@{user?.username}</p>
              </div>
            </div>
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Abrir menu da conta">
                  <Settings aria-hidden />
                </Button>
              }
            >
              <DropdownItem icon={UserIcon} onSelect={() => undefined}>
                <Link to="/app/profile" className="flex-1">
                  Meu perfil
                </Link>
              </DropdownItem>
              <DropdownItem icon={Github}>
                <Link to="/app/settings/integrations" className="flex-1">
                  Integração GitHub
                </Link>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={LogOut} danger onSelect={() => void logout()}>
                Sair da conta
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="ds-glass sticky top-0 z-20 flex h-14 items-center justify-between px-4 lg:hidden">
          <Link to="/app" className="inline-flex items-center gap-2" aria-label="DevRats — início">
            <Logo />
          </Link>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Link to="/app/notifications">
                <Bell aria-hidden />
                {unread > 0 ? (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-volt ring-2 ring-bg" aria-hidden />
                ) : null}
              </Link>
            </Button>
            <Link to="/app/profile" aria-label="Meu perfil" className="ml-1">
              <Avatar src={user?.avatarUrl} name={user?.displayName ?? 'Dev'} size="sm" />
            </Link>
          </div>
        </header>

        <main className="min-h-dvh pb-28 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <BottomNav unread={unread} />
    </div>
  );
}

function BottomNav({ unread }: { unread: number }) {
  const location = useLocation();
  const left = primaryNav.slice(0, 2);
  const right = primaryNav.slice(2);

  //---- Editors take over the viewport on mobile; the page header has its own back link.
  if (location.pathname === '/app/groups/new' || location.pathname.endsWith('/settings')) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="ds-safe-bottom fixed inset-x-0 bottom-0 z-30 lg:hidden"
    >
      <div className="mx-3 mb-2 flex items-center justify-between rounded-2xl border border-line bg-[color-mix(in_srgb,var(--ds-card)_88%,transparent)] px-2 py-1.5 shadow-2xl backdrop-blur-xl">
        {left.map((item) => (
          <MobileTab
            key={item.to}
            {...item}
            active={item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)}
          />
        ))}

        <Link
          to="/app/groups/new"
          aria-label="Criar novo desafio"
          className="ds-focus-ring -mt-6 inline-flex size-12 items-center justify-center rounded-2xl bg-volt text-volt-ink shadow-[0_12px_30px_-8px_rgba(200,255,61,0.55)] transition-transform active:scale-95"
        >
          <Plus className="size-6" aria-hidden strokeWidth={2.4} />
        </Link>

        {right.map((item) => (
          <MobileTab
            key={item.to}
            {...item}
            active={location.pathname.startsWith(item.to)}
            badge={item.to === '/app/notifications' ? unread : 0}
          />
        ))}
      </div>
    </nav>
  );
}

function MobileTab({
  to,
  label,
  icon: Icon,
  active,
  badge = 0,
}: {
  to: string;
  label: string;
  icon: IconComponent;
  active: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={cn(
        'ds-focus-ring relative flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors',
        active ? 'text-accent' : 'text-faint',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
      {badge > 0 ? (
        <span className="absolute right-3 top-1 size-1.5 rounded-full bg-volt" aria-hidden />
      ) : null}
    </NavLink>
  );
}
