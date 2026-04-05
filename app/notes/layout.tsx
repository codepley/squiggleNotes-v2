/**
 * Notes layout — wraps all /notes/* routes with the app shell.
 * Sidebar + main panel + revision notification banner.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { RevisionBanner } from '@/components/revision/RevisionBanner';

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0E0E0F]">
      {/* Revision due banner */}
      <RevisionBanner />

      {/* Sidebar with collapse animation */}
      <div className="flex h-full">
        <motion.aside
          id="notes-sidebar"
          initial={false}
          animate={{ width: isSidebarCollapsed ? 0 : 256 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r border-white/[0.06] bg-[#161618] overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <Sidebar />
        </motion.aside>

        {/* Toggle button - always visible */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-10 h-10 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] text-[#F0EDE6]/60 hover:text-[#F0EDE6] transition-colors text-sm flex-shrink-0 border-r border-white/[0.06]"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? '›' : '‹'}
        </motion.button>
      </div>

      {/* Main content area */}
      <main className="relative flex-1 overflow-auto">{children}</main>
    </div>
  );
}
