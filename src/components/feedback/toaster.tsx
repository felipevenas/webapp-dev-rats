import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/core/lib/theme';

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      offset={{ bottom: 24, right: 24 }}
      mobileOffset={{ bottom: 96, right: 12 }}
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group !rounded-xl !border !border-line !bg-elevated !text-fg !shadow-float !font-sans !text-sm',
          title: '!font-medium',
          description: '!text-muted !text-xs',
          actionButton: '!bg-volt !text-volt-ink !font-medium',
          cancelButton: '!bg-card-2 !text-fg',
          closeButton: '!bg-card-2 !border-line !text-muted',
          success: '!text-fg',
          error: '!border-rose/40',
        },
      }}
    />
  );
}
