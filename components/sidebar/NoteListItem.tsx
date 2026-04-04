'use client';

/**
 * NoteListItem — note preview card with title, last edited time, and delete.
 * Used inside the Sidebar to list notes in the active folder.
 */

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

interface NoteListItemProps {
  id: string;
  title: string;
  updatedAt: string;
  onDelete: (id: string) => void;
}

export function NoteListItem({ id, title, updatedAt, onDelete }: NoteListItemProps) {
  const router = useRouter();
  const params = useParams();
  const isActive = params?.noteId === id;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = useCallback(() => {
    router.push(`/notes/${id}`);
  }, [id, router]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showConfirm) {
        onDelete(id);
        setShowConfirm(false);
      } else {
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 3000);
      }
    },
    [id, onDelete, showConfirm],
  );

  // Format relative time
  const timeAgo = formatRelativeTime(updatedAt);

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'group w-full text-left px-3 py-2.5 rounded-lg transition-colors relative',
        isActive
          ? 'bg-[#4F6EF7]/10 border border-[#4F6EF7]/20'
          : 'hover:bg-white/[0.04] border border-transparent',
      )}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#F0EDE6]' : 'text-[#F0EDE6]/70',
            )}
          >
            {title || 'Untitled Note'}
          </p>
          <p className="text-[11px] text-[#F0EDE6]/30 mt-0.5">{timeAgo}</p>
        </div>

        {/* Delete button */}
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
          whileTap={{ scale: 0.85 }}
        >
          <button
            onClick={handleDelete}
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center text-[10px] transition-colors',
              showConfirm
                ? 'bg-[#FF453A] text-white'
                : 'text-[#F0EDE6]/30 hover:text-[#FF453A] hover:bg-[#FF453A]/10',
            )}
            title={showConfirm ? 'Click again to confirm' : 'Delete note'}
          >
            {showConfirm ? '!' : '×'}
          </button>
        </motion.div>
      </div>
    </motion.button>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
