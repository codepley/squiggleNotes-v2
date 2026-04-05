/**
 * Auth pages shared layout.
 * Centers content, manages the dark aesthetic.
 */

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0E0E0F] relative overflow-hidden grain">
      {/* Absolute top logo */}
      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="text-2xl text-[#F0EDE6] hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-caveat), cursive' }}
        >
          Squiggle<span className="text-[#F5A623]">Notes</span>
        </Link>
      </div>

      {children}
    </div>
  );
}
