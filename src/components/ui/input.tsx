import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/core/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'ds-focus-ring h-11 w-full rounded-xl border border-line bg-card-2 px-3.5 text-sm text-fg outline-none transition-colors placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-60',
          'hover:border-line-strong focus:border-volt-line',
          'aria-[invalid=true]:border-rose aria-[invalid=true]:focus:border-rose',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'ds-focus-ring min-h-24 w-full resize-y rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint',
          'hover:border-line-strong focus:border-volt-line',
          'aria-[invalid=true]:border-rose',
          className,
        )}
        {...props}
      />
    );
  },
);

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">
          {label}
          {optional ? (
            <span className="ml-1.5 text-xs font-normal text-faint">· opcional</span>
          ) : null}
        </label>
        {hint ? <span className="ml-auto text-right text-xs text-faint">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-xs text-rose" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function useFieldId(provided?: string) {
  const generated = useId();
  return provided ?? generated;
}
