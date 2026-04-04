/**
 * Notes layout — wraps all /notes/* routes with the app shell.
 * Sidebar + main panel structure.
 */

import { Sidebar } from '@/components/sidebar/Sidebar';

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0E0E0F]">
      {/* Sidebar */}
      <aside
        id="notes-sidebar"
        className="w-64 flex-shrink-0 border-r border-white/[0.06] bg-[#161618]"
      >
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="relative flex-1 overflow-auto">{children}</main>
    </div>
  );
}
