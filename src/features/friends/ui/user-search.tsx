import { Loader2, Search, UserX } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebouncedValue } from '@/core/lib/use-debounced-value';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FRIENDS_PAGE_COPY } from '@/features/friends/domain/friend-copy';
import { FriendButton } from '@/features/friends/ui/friend-button';
import { useUserSearch } from '@/features/users/data/use-public-profile';

const MIN_QUERY_LENGTH = 2;

interface UserSearchProps {
  className?: string;
}

export function UserSearch({ className }: UserSearchProps) {
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term.trim(), 300);
  const ready = debounced.length >= MIN_QUERY_LENGTH;
  const hintId = useId();
  const resultsId = useId();

  const { data, isLoading, isFetching, isError, error, refetch } = useUserSearch(debounced);
  const results = data ?? [];

  const statusMessage = !ready
    ? term.trim().length > 0
      ? FRIENDS_PAGE_COPY.searchHint
      : ''
    : isFetching
      ? 'Buscando usuários…'
      : results.length === 0
        ? 'Nenhum usuário encontrado.'
        : `${results.length} ${results.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}.`;

  return (
    <section className={className} aria-labelledby="user-search-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="user-search-title" className="text-sm font-semibold">
          Encontrar pessoas
        </h2>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
          até 10 resultados
        </span>
      </div>

      <div className="relative mt-2.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={FRIENDS_PAGE_COPY.searchPlaceholder}
          aria-label="Buscar pessoas por nome de usuário"
          aria-describedby={hintId}
          aria-controls={resultsId}
          autoComplete="off"
          spellCheck={false}
          className="pl-9 pr-9"
        />
        {isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-faint" aria-hidden />
        ) : null}
      </div>

      <p id={hintId} aria-live="polite" className="mt-1.5 min-h-4 text-[11px] leading-relaxed text-faint">
        {statusMessage || FRIENDS_PAGE_COPY.searchHint}
      </p>

      <div id={resultsId} className="mt-2">
        {!ready ? (
          <p className="rounded-xl border border-dashed border-line bg-card-2/60 px-3 py-4 text-[11px] leading-relaxed text-muted">
            Use o @ exato ou o começo do usuário. Resultados aparecem após {MIN_QUERY_LENGTH} caracteres.
          </p>
        ) : isLoading ? (
          <div className="space-y-1.5" aria-hidden>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} compact onRetry={() => void refetch()} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={UserX}
            compact
            title="Nenhum usuário encontrado"
            description="Confira o @ e tente um prefixo menor."
          />
        ) : (
          <ul className="space-y-1.5">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-card-2 p-2"
              >
                <Link
                  to={`/app/users/${result.username}`}
                  className="ds-focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-lg"
                >
                  <Avatar src={result.avatarUrl} name={result.displayName} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-fg">
                      {result.displayName}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-faint">
                      @{result.username}
                    </span>
                  </span>
                </Link>
                <FriendButton
                  compact
                  userId={result.id}
                  username={result.username}
                  displayName={result.displayName}
                  status={result.friendshipStatus}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
