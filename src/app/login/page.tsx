'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/projects';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="font-display text-3xl text-ink">Foundry AI</h1>
        </Link>
        <p className="mt-2 text-ink-muted text-sm">Sign in to your dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-light mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-light mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent text-white py-2.5 text-sm font-medium hover:bg-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm text-center text-ink-muted text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
