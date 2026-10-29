import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

const buttonVariants = cva(
  'ds-focus-ring relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-volt text-volt-ink shadow-[0_10px_30px_-14px_color-mix(in_srgb,var(--ds-volt)_70%,transparent)] hover:brightness-105 disabled:border disabled:border-line disabled:bg-card-2 disabled:text-faint disabled:shadow-none',
        secondary:
          'border border-line bg-card-2 text-fg hover:border-line-strong hover:bg-elevated',
        outline: 'border border-line-strong bg-transparent text-fg hover:bg-card-2',
        ghost: 'text-muted hover:bg-card-2 hover:text-fg',
        accent: 'border border-volt-line bg-volt-soft text-accent hover:brightness-[1.03]',
        danger: 'bg-rose text-white hover:brightness-110',
        'danger-ghost': 'text-rose hover:bg-rose-soft',
        link: 'h-auto rounded-none p-0 text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-[13px] [&_svg]:size-4',
        md: 'h-11 px-4 text-sm [&_svg]:size-4',
        lg: 'h-12 px-5 text-[15px] [&_svg]:size-4.5',
        icon: 'size-10 [&_svg]:size-4.5',
        'icon-sm': 'size-9 [&_svg]:size-4',
        'icon-lg': 'size-12 [&_svg]:size-5',
      },
      full: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  full,
  asChild,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      className={cn(buttonVariants({ variant, size, full }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          <span className="sr-only">Carregando</span>
          {children}
        </>
      ) : (
        children
      )}
    </Component>
  );
}

export { buttonVariants };
