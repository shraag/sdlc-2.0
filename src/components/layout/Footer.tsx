import { Container } from '@/components/ui/Container';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:gap-16">
          <div className="col-span-2 sm:col-span-1">
            <a href="/" className="flex items-center gap-1.5 mb-5">
              <span className="font-display text-lg text-ink">Foundry</span>
              <span className="font-display text-lg italic text-accent">AI</span>
            </a>
            <p className="text-sm text-ink-muted leading-relaxed">
              We build production-grade software at the speed of AI.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-light transition-colors hover:text-ink">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-ink-muted">&copy; {new Date().getFullYear()} Foundry AI. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
