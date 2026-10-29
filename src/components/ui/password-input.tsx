import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/core/lib/cn';

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="ds-focus-ring absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:text-fg"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
