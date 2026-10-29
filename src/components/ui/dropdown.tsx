import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import type { IconComponent } from '@/core/types/ui';
import { cn } from '@/core/lib/cn';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'end', className }: DropdownProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn(
            'z-50 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-2xl',
            'data-[state=open]:animate-fade-in',
            className,
          )}
        >
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  icon?: IconComponent;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onSelect, icon: Icon, danger, disabled }: DropdownItemProps) {
  return (
    <DropdownPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        'data-[highlighted]:bg-card-2',
        danger ? 'text-rose data-[highlighted]:bg-rose-soft' : 'text-fg',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      {children}
    </DropdownPrimitive.Item>
  );
}

export function DropdownSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-line" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownPrimitive.Label className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
      {children}
    </DropdownPrimitive.Label>
  );
}
