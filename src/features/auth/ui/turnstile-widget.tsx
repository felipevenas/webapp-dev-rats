import { useEffect, useRef } from 'react';
import { turnstileSiteKey } from '@/core/config/env';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'auto' | 'light' | 'dark';
          language?: string;
          size?: 'normal' | 'compact' | 'flexible';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  className?: string;
}

/**
 * Widget do Cloudflare Turnstile em modo explícito.
 *
 * O token é de uso único: o formulário deve remontar o widget (via `key`) depois
 * de uma falha para obter um token novo. Sem site key configurada, nada é renderizado
 * e o backend decide se a verificação está habilitada.
 */
export function TurnstileWidget({ onToken, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    let cancelled = false;

    const removeWidget = () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      removeWidget();
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'auto',
        language: 'pt-BR',
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => onTokenRef.current(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        cancelled = true;
        removeWidget();
      };
    }

    const scriptId = 'cf-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', renderWidget, { once: true });

    return () => {
      cancelled = true;
      script?.removeEventListener('load', renderWidget);
      removeWidget();
    };
  }, []);

  if (!turnstileSiteKey) {
    return null;
  }
  return <div ref={containerRef} className={className} />;
}
