/**
 * Revision layout — wraps /revision/* routes with header + back nav.
 */

import Link from 'next/link';

export default function RevisionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-[#0E0E0F]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#161618]">
        <div className="flex items-center gap-3">
          <Link
            href="/notes"
            className="flex items-center gap-1.5 text-xs text-[#F0EDE6]/40 hover:text-[#F0EDE6]/70 transition-colors"
          >
            <span className="text-[10px]">←</span> Notes
          </Link>
          <span className="text-[#F0EDE6]/10">|</span>
          <h1
            className="text-base font-semibold text-[#F0EDE6]/80"
            style={{ fontFamily: 'var(--font-caveat), cursive' }}
          >
            📖 Revision
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
