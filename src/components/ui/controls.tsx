import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

export function Switch({ checked, onCheckedChange, disabled, id, label }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label: string;
}) {
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'ds-focus-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
        checked ? 'border-volt-line bg-volt' : 'border-line-strong bg-card-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px] bg-volt-ink' : 'translate-x-[3px]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export function Checkbox({ checked, onCheckedChange, disabled, id, label }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label: string;
}) {
  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'ds-focus-ring flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
        checked ? 'border-volt bg-volt text-volt-ink' : 'border-line-strong bg-card-2 hover:border-muted',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5 stroke-[3]" aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'ds-focus-ring h-11 w-full appearance-none rounded-xl border border-line bg-card-2 pl-3.5 pr-10 text-sm text-fg outline-none transition-colors',
          'hover:border-line-strong focus:border-volt-line',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
    </div>
  );
});
