import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  // Task statuses
  todo: 'bg-dash-text-muted/10 text-dash-text-muted',
  in_progress: 'bg-blue-500/10 text-blue-400',
  in_review: 'bg-amber-500/10 text-amber-400',
  done: 'bg-emerald-500/10 text-emerald-400',
  // Project statuses
  active: 'bg-emerald-500/10 text-emerald-400',
  archived: 'bg-dash-text-muted/10 text-dash-text-muted',
  completed: 'bg-emerald-500/10 text-emerald-400',
  // Sprint statuses
  planning: 'bg-violet-500/10 text-violet-400',
  // Bug statuses
  open: 'bg-red-500/10 text-red-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
  closed: 'bg-dash-text-muted/10 text-dash-text-muted',
  // Voice session statuses
  new: 'bg-blue-500/10 text-blue-400',
  reviewed: 'bg-amber-500/10 text-amber-400',
  converted: 'bg-emerald-500/10 text-emerald-400',
  // Test statuses
  pending: 'bg-dash-text-muted/10 text-dash-text-muted',
  passed: 'bg-emerald-500/10 text-emerald-400',
  failed: 'bg-red-500/10 text-red-400',
  skipped: 'bg-amber-500/10 text-amber-400',
};

const LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  sprint_planning: 'Sprint Planning',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] || 'bg-dash-surface-2 text-dash-text-secondary',
        className
      )}
    >
      {label}
    </span>
  );
}
