import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, href, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary: 'bg-ink text-warm-50 hover:bg-warm-700 shadow-sm',
      secondary: 'border border-border text-ink hover:bg-warm-100 hover:border-warm-300',
      ghost: 'text-ink-light hover:text-ink hover:bg-warm-100',
    };

    const sizes = {
      sm: 'text-sm px-5 py-2 gap-2',
      md: 'text-sm px-6 py-3 gap-2',
      lg: 'text-base px-8 py-4 gap-2.5',
    };

    if (href) {
      return (
        <a href={href} className={cn(base, variants[variant], sizes[size], className)}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
