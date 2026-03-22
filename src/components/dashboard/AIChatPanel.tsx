'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Plus, Sparkles } from 'lucide-react';
import type { ChatMessage } from '@/types/dashboard';

const SUGGESTION_CHIPS = [
  'Create a user story for login feature',
  'Generate test cases for checkout flow',
  'Plan sprint from backlog',
  'Summarize sprint progress',
];

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  context?: string;
}

export function AIChatPanel({ open, onClose, projectId, context }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMode, setActionMode] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function newChat() {
    setMessages([]);
    setInput('');
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          projectId,
          context,
          actionMode,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.content || 'Sorry, I encountered an error.',
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Failed to connect to AI. Check your API key.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Parse inline markdown (bold, italic, code) into React nodes
  function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code: `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`/);
      // Bold: **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/);
      // Italic: *text* (but not **)
      const italicMatch = remaining.match(/^(.*?)(?<!\*)\*([^*]+)\*(?!\*)/);

      // Find earliest match
      const matches = [
        codeMatch ? { type: 'code', match: codeMatch } : null,
        boldMatch ? { type: 'bold', match: boldMatch } : null,
        italicMatch ? { type: 'italic', match: italicMatch } : null,
      ].filter(Boolean).sort((a, b) => a!.match[1].length - b!.match[1].length);

      if (matches.length > 0) {
        const { type, match } = matches[0]!;
        // Add text before the match
        if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
        // Add the formatted part
        if (type === 'bold') parts.push(<strong key={key++} className="font-semibold text-dash-text">{match[2]}</strong>);
        else if (type === 'italic') parts.push(<em key={key++} className="italic">{match[2]}</em>);
        else if (type === 'code') parts.push(<code key={key++} className="rounded bg-dash-surface-3 px-1 py-0.5 text-[11px] font-mono text-dash-accent">{match[2]}</code>);
        remaining = remaining.slice(match[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }
    return parts;
  }

  function renderContent(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLang = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block fences
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
          codeLines = [];
        } else {
          elements.push(
            <div key={i} className="my-2 rounded-lg bg-dash-bg border border-dash-border overflow-hidden">
              {codeLang && <div className="px-3 py-1 text-[10px] text-dash-text-muted border-b border-dash-border uppercase tracking-wider">{codeLang}</div>}
              <pre className="p-3 text-[11px] leading-relaxed font-mono text-dash-text-secondary overflow-x-auto">
                {codeLines.join('\n')}
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeLines = [];
          codeLang = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h4 key={i} className="font-semibold text-dash-text text-[13px] mt-3 mb-1">{parseInline(line.slice(4))}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={i} className="font-semibold text-dash-text text-sm mt-3 mb-1">{parseInline(line.slice(3))}</h3>);
      } else if (line.startsWith('# ')) {
        elements.push(<h2 key={i} className="font-bold text-dash-text text-[15px] mt-3 mb-1">{parseInline(line.slice(2))}</h2>);
      }
      // Bullets (-, *, or indented -)
      else if (/^\s*[-*]\s/.test(line)) {
        const indent = line.match(/^(\s*)/)?.[1].length || 0;
        const content = line.replace(/^\s*[-*]\s/, '');
        elements.push(
          <div key={i} className="flex items-start gap-2" style={{ paddingLeft: `${Math.min(indent, 4) * 8 + 4}px` }}>
            <span className="text-dash-accent mt-[3px] text-[8px] shrink-0">●</span>
            <span className="flex-1">{parseInline(content)}</span>
          </div>
        );
      }
      // Numbered lists
      else if (/^\s*\d+\.\s/.test(line)) {
        const match = line.match(/^\s*(\d+)\.\s(.*)/);
        if (match) {
          elements.push(
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="text-dash-accent font-medium text-[11px] mt-[2px] shrink-0 w-4 text-right">{match[1]}.</span>
              <span className="flex-1">{parseInline(match[2])}</span>
            </div>
          );
        }
      }
      // Horizontal rule
      else if (/^---+$/.test(line.trim())) {
        elements.push(<hr key={i} className="border-dash-border my-2" />);
      }
      // Empty line
      else if (!line.trim()) {
        elements.push(<div key={i} className="h-1.5" />);
      }
      // Regular paragraph
      else {
        elements.push(<p key={i}>{parseInline(line)}</p>);
      }
    }

    return elements;
  }

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-40 flex h-screen w-80 flex-col border-l border-dash-border bg-dash-surface shadow-xl">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-dash-border px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-dash-accent" />
          <span className="text-sm font-semibold text-dash-text">Foundry AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={newChat} className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-dash-text-muted hover:bg-dash-surface-2 hover:text-dash-text transition cursor-pointer">
            <Plus className="h-3 w-3" /> New Chat
          </button>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-dash-text-muted hover:bg-dash-surface-2 hover:text-dash-text transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 dash-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-surface-2 mb-4">
              <Bot className="h-7 w-7 text-dash-accent" />
            </div>
            <p className="text-sm font-semibold text-dash-text mb-1">Hi! I&apos;m <span className="text-dash-accent">Foundry AI</span></p>
            <p className="text-xs text-dash-text-muted mb-6 leading-relaxed">
              Your intelligent project management assistant. I can help you manage tasks, plan sprints, generate documentation, and streamline your workflow.
            </p>
            <p className="text-xs text-dash-text-muted mb-3">Try asking me things like:</p>
            <div className="space-y-2 w-full">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="w-full rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-xs text-dash-text-secondary hover:bg-dash-surface-2 hover:text-dash-text hover:border-dash-accent/30 transition cursor-pointer text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-dash-accent text-white'
                  : 'bg-dash-surface-2 text-dash-text border border-dash-border'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl bg-dash-surface-2 border border-dash-border px-3.5 py-2.5 text-sm text-dash-text-muted">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-dash-border p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you today?"
            className="flex-1 rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 focus:border-dash-accent/50 transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-white hover:bg-dash-accent-hover transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative w-8 h-4 rounded-full transition-colors ${actionMode ? 'bg-dash-accent' : 'bg-dash-surface-3'}`}>
              <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${actionMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[10px] text-dash-text-muted">Action Mode</span>
          </label>
        </div>
      </div>
    </div>
  );
}
