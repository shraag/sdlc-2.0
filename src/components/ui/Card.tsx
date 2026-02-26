import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  highlight?: boolean;
}

export function Card({ children, className, hover = false, highlight = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white p-6 sm:p-8',
        hover && 'transition-all duration-300 hover:shadow-lg hover:shadow-ink/5 hover:-translate-y-0.5 hover:border-warm-300',
        highlight && 'border-accent/20 bg-accent-light/30 ring-1 ring-accent/10',
        className
      )}
    >
      {children}
    </div>
  );
}
