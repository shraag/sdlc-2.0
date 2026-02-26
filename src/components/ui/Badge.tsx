import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-warm-100 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-light',
        className
      )}
    >
      {children}
    </span>
  );
}
