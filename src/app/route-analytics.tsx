import { Analytics } from '@vercel/analytics/react';
import { useLocation } from 'react-router-dom';

/**
 * O Web Analytics da Vercel cobre o carregamento inicial sozinho, mas o app é uma SPA: cada
 * navegação do React Router precisa ser reportada manualmente. Informar `route` desliga o auto
 * track do script para a mesma página não ser contada duas vezes.
 */
export function RouteAnalytics() {
  const { pathname } = useLocation();

  return (
    <Analytics
      mode={import.meta.env.PROD ? 'production' : 'development'}
      route={pathname}
      path={pathname}
    />
  );
}
