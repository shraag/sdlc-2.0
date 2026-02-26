'use client';

import { Github, Figma, MessageSquare, Webhook } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'GitHub',
    description: 'Connect your repositories for version control and CI/CD.',
    icon: Github,
    status: 'available' as const,
  },
  {
    name: 'Figma',
    description: 'Link design files for seamless design-to-dev handoff.',
    icon: Figma,
    status: 'available' as const,
  },
  {
    name: 'Slack',
    description: 'Get notifications and updates in your Slack channels.',
    icon: MessageSquare,
    status: 'coming_soon' as const,
  },
  {
    name: 'Webhooks',
    description: 'Set up custom webhooks to integrate with any service.',
    icon: Webhook,
    status: 'coming_soon' as const,
  },
];

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-dash-text">Integrations</h2>
        <p className="text-sm text-dash-text-muted mt-1">
          Connect your tools for a unified workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="rounded-xl border border-dash-border bg-dash-surface p-5 flex items-start gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dash-surface-2 shrink-0">
              <integration.icon className="h-5 w-5 text-dash-text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-dash-text">{integration.name}</h3>
                {integration.status === 'coming_soon' && (
                  <span className="rounded-full bg-dash-surface-3 px-2 py-0.5 text-[10px] font-medium text-dash-text-muted">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-dash-text-muted mb-3">{integration.description}</p>
              <button
                disabled={integration.status === 'coming_soon'}
                className="rounded-lg border border-dash-border px-3 py-1.5 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-2 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {integration.status === 'coming_soon' ? 'Unavailable' : 'Configure'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
