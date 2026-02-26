import type { NavLink, Service, PlatformFeature, ProcessStep, Metric, Testimonial, FAQItem } from '@/types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Platform', href: '#platform' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#results' },
];

export const SERVICES: Service[] = [
  {
    num: '01',
    title: 'Requirements Engineering',
    description: 'Our AI voice agent joins your discovery calls, captures every detail, and produces structured specs — no manual notes, no lost context.',
    icon: 'mic',
  },
  {
    num: '02',
    title: 'Product Design',
    description: 'From wireframes to pixel-perfect UI. We design interfaces that are both beautiful and engineered for real user workflows.',
    icon: 'palette',
  },
  {
    num: '03',
    title: 'Development',
    description: 'Full-stack engineering with AI-assisted code generation, automated testing, and continuous integration from day one.',
    icon: 'code',
  },
  {
    num: '04',
    title: 'Quality Assurance',
    description: 'Automated test suites, API testing, and security scanning built into every sprint. QA is never an afterthought.',
    icon: 'shield-check',
  },
  {
    num: '05',
    title: 'Deployment & DevOps',
    description: 'Production-ready infrastructure with CI/CD pipelines, monitoring, and documentation from the first release.',
    icon: 'rocket',
  },
];

export const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    title: 'Voice Requirements Agent',
    description: 'Our AI joins your calls, listens in real-time, and auto-generates structured specifications — epics, user stories, and acceptance criteria.',
    icon: 'mic',
    highlighted: true,
  },
  {
    title: 'Sprint Management',
    description: 'Kanban boards, backlogs, and sprint planning powered by AI estimation. Track progress from epic to subtask.',
    icon: 'kanban-square',
  },
  {
    title: 'AI Assistant',
    description: 'Generate user stories, test cases, and acceptance criteria in natural language. Your AI pair for project management.',
    icon: 'bot',
  },
  {
    title: 'Integrations',
    description: 'GitHub for version control, Jira for cross-platform sync, Figma for design handoff. Your existing tools, unified.',
    icon: 'puzzle',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    num: '01',
    title: 'Discovery',
    description: 'We listen. Our AI voice agent joins your kickoff calls and structures requirements in real-time. No detail gets lost.',
  },
  {
    num: '02',
    title: 'Sprint',
    description: 'Weekly delivery cycles. AI handles specs, estimation, and test generation while our engineers build production-grade code.',
  },
  {
    num: '03',
    title: 'Ship',
    description: 'Production-ready releases with automated QA, security scanning, and deployment pipelines — not just demos.',
  },
  {
    num: '04',
    title: 'Scale',
    description: 'Continuous improvement with AI-powered monitoring, bug tracking, and living documentation that evolves with your product.',
  },
];

export const METRICS: Metric[] = [
  { value: '10', suffix: 'x', label: 'Faster to production' },
  { value: '95', suffix: '%', label: 'Requirements accuracy' },
  { value: '40', suffix: '%', label: 'Cost reduction' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: 'Foundry AI delivered in 3 weeks what our previous agency quoted 3 months for. The voice agent requirement sessions alone saved us dozens of hours.',
    author: 'Sarah Chen',
    title: 'VP of Engineering',
    company: 'TechScale Inc.',
  },
  {
    id: '2',
    quote: 'Working with Foundry feels like having a 10x engineering team. The AI handles the operational overhead, and the humans focus on the hard problems.',
    author: 'Marcus Rodriguez',
    title: 'Head of Product',
    company: 'CloudBridge Solutions',
  },
  {
    id: '3',
    quote: 'We went from idea to production MVP in 4 weeks. The structured sprint process and AI tooling made everything predictable.',
    author: 'Priya Patel',
    title: 'CTO',
    company: 'NexGen Labs',
  },
  {
    id: '4',
    quote: 'The fact that they use their own AI platform to deliver our project gave us immense confidence. They eat their own cooking.',
    author: 'James Wu',
    title: 'Engineering Manager',
    company: 'DataForge AI',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What types of projects do you build?',
    answer: 'We build production-grade web applications, SaaS platforms, mobile apps, and internal tools. Our sweet spot is complex software products that need to move fast without sacrificing quality — from early-stage MVPs to enterprise systems.',
  },
  {
    question: 'How does the AI voice agent work for requirements?',
    answer: 'Our AI agent joins your kickoff or discovery calls via a simple link. It listens to the natural conversation, identifies requirements, and automatically structures them into epics, user stories, and acceptance criteria. You review and approve — no manual note-taking.',
  },
  {
    question: 'How is this different from a traditional dev agency?',
    answer: 'Traditional agencies rely on manual processes for requirements, estimation, documentation, and QA. We\'ve built our own AI-native platform that automates these operational layers, which lets our engineers focus entirely on building your product — at roughly half the timeline.',
  },
  {
    question: 'What does a typical engagement look like?',
    answer: 'We start with a strategy call to understand your vision. Then we run a discovery sprint using our voice agent. From there, we deliver in weekly sprint cycles with continuous demos. Most MVPs are production-ready within 4-8 weeks.',
  },
  {
    question: 'Can you work with our existing codebase?',
    answer: 'Absolutely. We integrate with your existing GitHub repositories, CI/CD pipelines, and development workflows. Our platform connects to your tools, not the other way around.',
  },
  {
    question: 'How do you handle security and data privacy?',
    answer: 'All voice data is processed in real-time and not stored unless you opt in. We support SOC 2 compliance, encrypted data at rest and in transit, and can deploy within your own infrastructure for enterprise clients.',
  },
];

export const FOOTER_LINKS = {
  services: [
    { label: 'Requirements', href: '#services' },
    { label: 'Development', href: '#services' },
    { label: 'QA & Testing', href: '#services' },
    { label: 'DevOps', href: '#services' },
  ],
  platform: [
    { label: 'Voice Agent', href: '#platform' },
    { label: 'Sprint Board', href: '#platform' },
    { label: 'AI Assistant', href: '#platform' },
    { label: 'Integrations', href: '#platform' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#cta' },
    { label: 'Privacy Policy', href: '#' },
  ],
};
