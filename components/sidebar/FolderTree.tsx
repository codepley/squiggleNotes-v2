'use client';

/**
 * FolderTree — recursive folder rendering with expand/collapse.
 * AnimatePresence + height animation per the plan.
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FolderNode {
  _id: string;
  name: string;
  parentId: string | null;
  children?: FolderNode[];
}

interface FolderTreeProps {
  folders: FolderNode[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  depth?: number;
}

export function FolderTree({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  depth = 0,
}: FolderTreeProps) {
  return (
    <div className={depth > 0 ? 'ml-3 border-l border-white/[0.04] pl-2' : ''}>
      {folders.map((folder) => (
        <FolderItem
          key={folder._id}
          folder={folder}
          activeFolderId={activeFolderId}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          depth={depth}
        />
      ))}
    </div>
  );
}

// ─── Single folder item ───────────────────────────────────────────────────────

function FolderItem({
  folder,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  depth,
}: {
  folder: FolderNode;
  activeFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0); // root folders open by default
  const isActive = activeFolderId === folder._id;
  const hasChildren = folder.children && folder.children.length > 0;

  const handleClick = useCallback(() => {
    onSelectFolder(folder._id);
    if (hasChildren) setIsOpen((prev) => !prev);
  }, [folder._id, hasChildren, onSelectFolder]);

  return (
    <div>
      <motion.div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        className={cn(
          'group w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer',
          isActive
            ? 'bg-[#4F6EF7]/10 text-[#F0EDE6]'
            : 'text-[#F0EDE6]/50 hover:text-[#F0EDE6]/80 hover:bg-white/[0.03]',
        )}
      >
        {/* Chevron */}
        <motion.span
          className="text-[10px] w-3 text-center flex-shrink-0"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          {hasChildren ? '▶' : ''}
        </motion.span>

        {/* Folder icon */}
        <span className="text-xs flex-shrink-0">{isOpen ? '📂' : '📁'}</span>

        {/* Name */}
        <span className="truncate flex-1 text-left">{folder.name}</span>

        {/* Add subfolder */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            onCreateFolder(folder._id);
          }}
          role="button"
          tabIndex={0}
          className="opacity-0 group-hover:opacity-100 text-[10px] text-[#F0EDE6]/30 hover:text-[#F0EDE6]/60 transition-opacity w-4 h-4 flex items-center justify-center cursor-pointer"
          title="Add subfolder"
        >
          +
        </span>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <FolderTree
              folders={folder.children!}
              activeFolderId={activeFolderId}
              onSelectFolder={onSelectFolder}
              onCreateFolder={onCreateFolder}
              depth={depth + 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
