"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { firebaseAuth, getFirebaseAuthErrorMessage, googleProvider, signInWithPopup, assertFirebaseConfigured } from '@/lib/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialEmail?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialEmail = '' }: AuthModalProps) {
  const [error, setError] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && initialEmail) setEmail(initialEmail);
  }, [initialEmail, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const completeLogin = async (idToken: string, accountEmail?: string | null) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authProvider: 'FIREBASE',
        idToken,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 404) {
        if (accountEmail) setEmail(accountEmail);
        setNeedsRegistration(true);
        return;
      }
      throw new Error(data.error || 'Sign-in is temporarily unavailable. Please try again later.');
    }
    try {
      localStorage.setItem('trishulan_user', JSON.stringify(data.user));
    } catch (_) {}
    onSuccess(data.user);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setError('');
    setNeedsRegistration(false);
    setLoading(true);
    try {
      assertFirebaseConfigured();
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      await completeLogin(await result.user.getIdToken(), result.user.email);
    } catch (err: unknown) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNeedsRegistration(false);
    setResetSent(false);
    setLoading(true);
    try {
      assertFirebaseConfigured();
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await completeLogin(await credential.user.getIdToken());
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string'
          ? err.code
          : '';
      if (code === 'auth/user-not-found') {
        setNeedsRegistration(true);
      } else {
        setError(getFirebaseAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setResetSent(false);
    if (!email.trim()) {
      setError('Enter your email address first and we’ll send you a password reset link.');
      return;
    }

    setLoading(true);
    try {
      assertFirebaseConfigured();
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setResetSent(true);
    } catch (err: unknown) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-card w-full max-w-[420px] rounded-[20px] p-8 shadow-2xl relative border border-gray-100"
      >

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close sign-in dialog"
          onClick={onClose}
          className="absolute right-5 top-5 text-muted/70 hover:text-muted text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-line/30 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <div className="mb-8 text-center">
          <span className="text-[11px] font-bold tracking-[.1em] text-accent uppercase">
            TRISHULAN AUTHENTICATION
          </span>
          <h2 id="auth-modal-title" className="text-[24px] font-black text-ink mt-1">
            Sign In to Your Account
          </h2>
          <p className="text-[13px] text-[#64748B] mt-1">
            Access verified suppliers, live prices, and instant RFQs.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg">
            {error}
          </div>
        )}
        {needsRegistration && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-[13px] font-semibold text-amber-950">
              This sign-in isn’t linked to a Trishulan account yet. Create an account to get started.
            </p>
            <Link
              href={`/register${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
              onClick={onClose}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#c2410a]"
            >
              Create account
            </Link>
          </div>
        )}
        {resetSent && (
          <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-[13px] text-green-800">
            Password reset link sent. Check your inbox, then come back here to sign in.
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl border border-gray-300 bg-card hover:bg-card text-ink font-bold text-[14px] flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold text-muted">
          <span className="h-px flex-1 bg-line" />
          OR SIGN IN WITH EMAIL
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setNeedsRegistration(false);
              setResetSent(false);
            }}
            placeholder="Email address"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#c2410a] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in with email'}
          </button>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full py-1 text-[12px] font-semibold text-muted transition-colors hover:text-accent disabled:opacity-60"
          >
            Forgot your password?
          </button>
        </form>

        {/* Register Prompt */}
        <div className="mt-6 text-center text-[13px] text-muted">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
            onClick={onClose}
            className="text-accent font-bold hover:underline"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
