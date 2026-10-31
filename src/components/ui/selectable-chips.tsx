import { cn } from '@/core/lib/cn';

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface SelectableChipsProps<T extends string> {
  options: ReadonlyArray<ChipOption<T>>;
  selected: readonly T[];
  onChange: (next: T[]) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  max?: number;
  disabled?: boolean;
}

export function SelectableChips<T extends string>({
  options,
  selected,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  max,
  disabled,
}: SelectableChipsProps<T>) {
  const atLimit = max !== undefined && selected.length >= max;

  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    if (!atLimit) onChange([...selected, value]);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled || (!active && atLimit)}
            onClick={() => toggle(option.value)}
            className={cn(
              'ds-focus-ring rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors',
              active
                ? 'border-volt-line bg-volt-soft text-accent'
                : 'border-line bg-card-2 text-muted hover:border-line-strong hover:text-fg',
              (disabled || (!active && atLimit)) && 'cursor-not-allowed opacity-50 hover:border-line hover:text-muted',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
