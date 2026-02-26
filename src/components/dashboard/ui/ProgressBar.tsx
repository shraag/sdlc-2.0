import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, className, size = 'sm' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-dash-surface-3',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className
      )}
    >
      <div
        className="h-full rounded-full bg-dash-accent transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
