import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ children, subtitle, className, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <h2
        className={cn(
          'font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl',
          align === 'center' && 'mx-auto max-w-3xl'
        )}
      >
        {children}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-5 text-base leading-relaxed text-ink-muted sm:text-lg',
            align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-xl'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
