"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Eyebrow, Field, Square } from './ui';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // The field is readOnly (not disabled) while loading so it keeps focus; this covers a click on the button.
  function focusPassword() {
    document.getElementById('admin-password')?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorTitle('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setErrorTitle('');
        setError('Incorrect password. Try again.');
        setLoading(false);
        focusPassword();
      }
    } catch {
      setErrorTitle("Couldn't sign in");
      setError('Something went wrong. Try again.');
      setLoading(false);
      focusPassword();
    }
  }

  const network = errorTitle !== '';
  return (
    <main className="public-shell flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex gap-1.5">
          <Square color="blue" size={8} /> <Square color="orange" size={8} /> <Square color="yellow" size={8} /> <Square color="green" size={8} /> <Square color="pink" size={8} /> <Square color="navy" size={8} /> <Square color="sky" size={8} />
        </div>
        <Eyebrow>Admin</Eyebrow>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Erick Clark</h1>
        <p className="mb-8 mt-1 text-ink-muted">Sign in to edit the site.</p>
        {network && (
          <div id="admin-password-error" role="alert" className="mb-6 border border-error px-4 py-3">
            <p className="font-display text-lg font-semibold text-error">{errorTitle}</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="admin-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            readOnly={loading}
            error={network ? undefined : error || undefined}
            {...(network ? { 'aria-describedby': 'admin-password-error' } : {})}
          />
          <Button type="submit" disabled={loading || !password} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  );
}
