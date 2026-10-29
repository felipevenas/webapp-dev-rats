import { Check, X } from 'lucide-react';
import { passwordRules, passwordScore, passwordStrengthLabel } from '@/features/auth/domain/password-rules';
import { cn } from '@/core/lib/cn';

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  const strength = passwordStrengthLabel(score);
  const toneClass = {
    rose: 'bg-rose',
    amber: 'bg-amber',
    volt: 'bg-volt',
  }[strength.tone];
  const textClass = {
    rose: 'text-rose',
    amber: 'text-amber',
    volt: 'text-accent',
  }[strength.tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                step <= score ? toneClass : 'bg-line-strong',
              )}
            />
          ))}
        </div>
        <span className={cn('font-mono text-[10px] uppercase tracking-[0.12em]', score > 0 ? textClass : 'text-faint')}>
          {score > 0 ? strength.label : 'Força'}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn('flex items-center gap-1.5 text-[11px]', passed ? 'text-muted' : 'text-faint')}
            >
              {passed ? (
                <Check className="size-3 text-accent" aria-hidden />
              ) : (
                <X className="size-3 text-faint" aria-hidden />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
