"use client";

import React, { useState } from 'react';
import { firebaseAuth, googleProvider, signInWithPopup } from '@/lib/firebase';
import { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'REGISTER') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, companyName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onSuccess(data.user);
        onClose();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authProvider: 'FIREBASE',
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          role: role,
          companyName: companyName || `${user.displayName}'s Company`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Firebase login failed');
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Firebase login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease]">
      <div className="bg-white w-full max-w-[440px] rounded-[20px] p-6 md:p-8 shadow-2xl relative border border-gray-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-[.1em] text-[#EA580C] uppercase">
            TRISHULAN AUTHENTICATION
          </span>
          <h2 className="text-[24px] font-black text-[#0A1629] mt-1">
            {mode === 'LOGIN' ? 'Sign In to Your Account' : 'Join Trishulan B2B'}
          </h2>
          <p className="text-[13px] text-[#64748B] mt-1">
            {mode === 'LOGIN' 
              ? 'Access verified suppliers, live prices, and instant RFQs.' 
              : 'Create a Buyer or Seller profile in under a minute.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg">
            {error}
          </div>
        )}

        {/* Firebase SSO Button */}
        <button
          type="button"
          onClick={handleFirebaseLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#0A1629] font-bold text-[14px] flex items-center justify-center gap-3 transition-all mb-4 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Firebase Google Auth
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-[11px] text-gray-400 uppercase font-semibold">OR JWT EMAIL LOGIN</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-[12px] font-bold text-[#0A1629] mb-1">Select Profile Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('BUYER')}
                    className={`py-2 rounded-lg text-[13px] font-bold border ${role === 'BUYER' ? 'bg-[#0A1629] text-white border-[#0A1629]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    I AM A BUYER
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SELLER')}
                    className={`py-2 rounded-lg text-[13px] font-bold border ${role === 'SELLER' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    I AM A SELLER
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0A1629] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0A1629] mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Industrial Pvt Ltd"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-bold text-[#0A1629] mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0A1629] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-[14px] transition-colors shadow-md mt-2"
          >
            {loading ? 'Processing...' : mode === 'LOGIN' ? 'Sign In with JWT' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-[13px] text-[#64748B]">
          {mode === 'LOGIN' ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('REGISTER')} 
                className="text-[#EA580C] font-bold hover:underline"
              >
                Register Now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('LOGIN')} 
                className="text-[#EA580C] font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
