/**
 * /signup — Auth signup page stub.
 * Supports ?email= pre-fill from the landing CTA (step 11.5).
 */
import { type SearchParams } from 'next/dist/server/request/search-params';

type PageProps = { searchParams: Promise<{ email?: string }> };

export default async function SignupPage({ searchParams }: PageProps) {
  const { email } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0F]">
      <div className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-[#161618] p-8">
        <h1 className="text-xl font-semibold text-[#F0EDE6]">Create your account</h1>
        {email && (
          <p className="mt-1 text-sm text-[#F5A623]/70">Pre-filled email: {email}</p>
        )}
        <p className="mt-1 text-sm text-[#F0EDE6]/40">Auth coming in step 11.5</p>
      </div>
    </div>
  );
}
