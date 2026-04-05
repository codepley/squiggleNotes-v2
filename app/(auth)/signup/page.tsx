'use client';

/**
 * /signup — Auth signup page stub.
 * This is currently mocked UI and will be integrated with NextAuth in step 11.5/6.
 */

import { useState } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Success! Immediately log them in
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError(signInRes.error);
        setLoading(false);
      } else {
        router.push('/notes');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-[400px] z-10 mx-6 p-8 rounded-2xl border border-white/[0.08] bg-[#161618] shadow-2xl glass"
    >
      <div className="mb-8 text-center text-[#F0EDE6]">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Create your account</h1>
        <p className="text-sm text-[#F0EDE6]/50">
          Start building your memory with SquiggleNotes.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#F0EDE6]/60 mb-1.5 ml-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            required
            className="w-full bg-[#1A1A1C] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F0EDE6] placeholder-[#F0EDE6]/30 focus:border-[#F5A623]/50 focus:bg-[#1A1A1C]/50 transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F0EDE6]/60 mb-1.5 ml-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            defaultValue={initialEmail}
            placeholder="you@domain.com"
            required
            className="w-full bg-[#1A1A1C] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F0EDE6] placeholder-[#F0EDE6]/30 focus:border-[#F5A623]/50 focus:bg-[#1A1A1C]/50 transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F0EDE6]/60 mb-1.5 ml-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full bg-[#1A1A1C] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F0EDE6] placeholder-[#F0EDE6]/30 focus:border-[#F5A623]/50 focus:bg-[#1A1A1C]/50 transition-colors outline-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E0941B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#1C1C1E] font-semibold tracking-wide shadow-lg"
        >
          {loading ? 'Creating...' : 'Get Started'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-[#F0EDE6]/40">
        <hr className="w-full border-white/[0.06]" />
        <span className="px-3 whitespace-nowrap">OR</span>
        <hr className="w-full border-white/[0.06]" />
      </div>

      <button
        onClick={() => signIn('google', { callbackUrl: '/notes' })}
        type="button"
        className="w-full mt-6 px-4 py-3 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-colors text-sm font-medium text-[#F0EDE6] flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
          </g>
        </svg>
        Sign up with Google
      </button>

      <p className="mt-8 text-center text-xs text-[#F0EDE6]/50">
        Already have an account?{' '}
        <Link href="/login" className="text-[#F5A623] hover:underline font-medium">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
