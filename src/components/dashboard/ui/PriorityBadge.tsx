import { cn } from '@/lib/utils';
import type { Priority } from '@/types/dashboard';

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red-500/10 text-red-400',
  high: 'bg-orange-500/10 text-orange-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  low: 'bg-dash-text-muted/10 text-dash-text-muted',
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize',
        PRIORITY_STYLES[priority],
        className
      )}
    >
      {priority}
    </span>
  );
}
