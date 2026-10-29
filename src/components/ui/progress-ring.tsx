import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  tone?: 'volt' | 'cyan' | 'rose' | 'amber';
  trackClassName?: string;
  className?: string;
  label?: string;
}

const toneColor: Record<string, string> = {
  volt: 'var(--ds-volt)',
  cyan: 'var(--ds-cyan)',
  rose: 'var(--ds-rose)',
  amber: 'var(--ds-amber)',
};

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  children,
  tone = 'volt',
  className,
  label,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const color = toneColor[tone];

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped)}% concluído`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-line-strong)"
          strokeWidth={stroke}
          opacity={0.5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{
            transition: 'stroke-dasharray 600ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: clamped > 0 ? `drop-shadow(0 0 6px color-mix(in srgb, ${color} 55%, transparent))` : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
