export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  num: string;
  title: string;
  description: string;
  icon: string;
}

export interface PlatformFeature {
  title: string;
  description: string;
  icon: string;
  highlighted?: boolean;
}

export interface ProcessStep {
  num: string;
  title: string;
  description: string;
}

export interface Metric {
  value: string;
  suffix: string;
  label: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type VoiceAgentStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isFinal: boolean;
}
