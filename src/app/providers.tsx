import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/core/auth/auth-provider';
import { ThemeProvider } from '@/core/lib/theme';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/feedback/toaster';
import { ChatSocketProvider } from '@/features/chat/data/chat-socket-provider';
import { queryClient } from '@/app/query-client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatSocketProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ChatSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
