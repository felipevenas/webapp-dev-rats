import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Globe,
  Layers,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_TIME_ZONE, formatFullDate, localDateInZone } from '@/core/lib/date';
import { formatNumber } from '@/core/lib/format';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Page } from '@/components/layout/page-header';
import { toAppError } from '@/core/http/problem';
import { friendshipStatusCopy } from '@/features/friends/domain/friend-copy';
import { FriendButton } from '@/features/friends/ui/friend-button';
import { PresenceDot } from '@/features/friends/ui/presence-dot';
import {
  experienceLevelLabel,
  safeExternalUrl,
  techStackLabel,
} from '@/features/profile/domain/profile-options';
import { usePublicProfile } from '@/features/users/data/use-public-profile';

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const query = usePublicProfile(username);
  const profile = query.data;

  useEffect(() => {
    if (profile?.friendshipStatus === 'SELF') {
      navigate('/app/profile', { replace: true });
    }
  }, [profile?.friendshipStatus, navigate]);

  if (query.isLoading) return <ProfileSkeleton />;

  if (query.isError || !profile) {
    const appError = toAppError(query.error);
    if (appError.status === 404) {
      return (
        <Page>
          <BackLink />
          <EmptyState
            icon={UserX}
            title="Perfil não encontrado"
            description="Este @usuário não existe ou a conta não está ativa."
            action={
              <Button asChild variant="secondary">
                <Link to="/app/friends">Voltar para amigos</Link>
              </Button>
            }
            secondaryAction={
              <Button asChild variant="ghost">
                <Link to="/app">Ir para o início</Link>
              </Button>
            }
          />
        </Page>
      );
    }
    return (
      <Page>
        <BackLink />
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          action={
            <Button asChild variant="secondary">
              <Link to="/app/friends">Voltar para amigos</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  if (profile.friendshipStatus === 'SELF') return null;

  const safeWebsite = safeExternalUrl(profile.websiteUrl);
  const levelLabel = experienceLevelLabel(profile.experienceLevel);
  const connection = friendshipStatusCopy(profile.friendshipStatus);

  return (
    <Page>
      <BackLink />

      <section className="ds-card relative overflow-hidden p-5 sm:p-6">
        <div className="ds-grid-bg-sm pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <Avatar src={profile.avatarUrl} name={profile.displayName} size="2xl" ring />
            <PresenceDot
              presence={profile.presence}
              className="absolute bottom-1 right-1"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] text-fg">
                  {profile.displayName}
                </h1>
                <p className="font-mono text-[12px] text-muted">@{profile.username}</p>
                {profile.presence ? (
                  <div className="mt-1.5">
                    <PresenceDot presence={profile.presence} withLabel />
                  </div>
                ) : null}
              </div>
              <FriendButton
                variant="primary"
                userId={profile.id}
                username={profile.username}
                displayName={profile.displayName}
                status={profile.friendshipStatus}
                className="shrink-0"
              />
            </div>

            {profile.bio ? (
              <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-muted">{profile.bio}</p>
            ) : null}

            {profile.location || safeWebsite ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                {profile.location ? (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">{profile.location}</span>
                  </span>
                ) : null}
                {safeWebsite ? (
                  <a
                    href={safeWebsite}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ds-focus-ring inline-flex min-w-0 items-center gap-1 rounded text-accent hover:underline"
                  >
                    <Globe className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">{websiteLabel(safeWebsite)}</span>
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {levelLabel ? (
                <Badge variant="violet" size="sm">
                  <Briefcase className="size-3" aria-hidden />
                  {levelLabel}
                </Badge>
              ) : null}
              <Badge variant="outline" size="sm">
                <CalendarDays className="size-3" aria-hidden />
                desde {memberSince(profile.createdAt)}
              </Badge>
            </div>
          </div>
        </div>

        <dl className="relative mt-5 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-3">
          <Metric icon={Users} label="Amigos" value={formatNumber(profile.friendsCount)} />
          <Metric icon={Briefcase} label="Nível" value={levelLabel ?? 'Não informado'} />
          <Metric icon={CalendarDays} label="Na rede desde" value={formatFullDate(localDateInZone(profile.createdAt, DEFAULT_TIME_ZONE))} />
        </dl>
      </section>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserRound className="size-4 text-muted" aria-hidden />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.bio ? (
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-muted">{profile.bio}</p>
              ) : (
                <p className="text-[12px] text-faint">Esta pessoa ainda não escreveu uma bio.</p>
              )}
              <dl className="space-y-2 border-t border-line pt-3 text-[11px]">
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted">Localização</dt>
                  <dd className="text-right text-fg">{profile.location || 'Não informada'}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted">Site</dt>
                  <dd className="min-w-0 text-right">
                    {safeWebsite ? (
                      <a
                        href={safeWebsite}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="ds-focus-ring inline-block max-w-full truncate rounded text-accent hover:underline"
                      >
                        {websiteLabel(safeWebsite)}
                      </a>
                    ) : (
                      <span className="text-fg">Não informado</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="size-4 text-muted" aria-hidden />
                Stack principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.primaryStack && profile.primaryStack.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="Stack principal">
                  {profile.primaryStack.map((code) => (
                    <li key={code}>
                      <Badge variant="outline" size="sm">
                        {techStackLabel(code)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-faint">Nenhuma stack informada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-accent" aria-hidden />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[13px] font-semibold text-fg">{connection.label}</p>
              <p className="text-[11px] leading-relaxed text-muted">{connection.description}</p>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-card/50 p-3 text-[10px] leading-relaxed text-faint">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
            A presença só aparece entre amigos. Perfis públicos nunca exibem e-mail, fuso horário ou
            preferências de notificação.
          </div>
        </aside>
      </div>
    </Page>
  );
}

function BackLink() {
  return (
    <div>
      <Link
        to="/app/friends"
        className="ds-focus-ring inline-flex items-center gap-1.5 rounded text-[12px] text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Voltar
      </Link>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card-2 p-3">
      <dt className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
        <Icon className="size-3" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 truncate text-[12px] font-medium text-fg">{value}</dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <Page>
      <Skeleton className="h-4 w-20" />
      <section className="ds-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    </Page>
  );
}

function websiteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function memberSince(instant: string) {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  })
    .format(date)
    .replace('.', '');
}
