'use client';

/**
 * Sidebar — folder tree + search bar + "New Note" / "New Folder" buttons + note list.
 * Seamless folder navigation with breadcrumb trail and back button.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { FolderTree, type FolderNode } from './FolderTree';
import { NoteListItem } from './NoteListItem';
import { cn } from '@/lib/utils';

// Due revision count for sidebar badge
function useDueCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    fetch('/api/revision/schedule')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setCount(data.length); })
      .catch(() => {});
  }, []);
  return count;
}

interface NoteItem {
  _id: string;
  title: string;
  updatedAt: string;
}

interface FlatFolder {
  _id: string;
  name: string;
  parentId: string | null;
}

// ─── Build tree from flat folder list ─────────────────────────────────────────

function buildTree(folders: FlatFolder[]): FolderNode[] {
  const map = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of folders) {
    map.set(f._id, { ...f, children: [] });
  }

  for (const f of folders) {
    const node = map.get(f._id)!;
    if (f.parentId && map.has(f.parentId)) {
      map.get(f.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ─── Build breadcrumb path from folder ID to root ─────────────────────────────

function buildBreadcrumb(
  folderId: string | null,
  flatFolders: FlatFolder[],
): { id: string; name: string }[] {
  if (!folderId) return [];

  const map = new Map<string, FlatFolder>();
  for (const f of flatFolders) map.set(f._id, f);

  const crumbs: { id: string; name: string }[] = [];
  let current = folderId;

  while (current) {
    const folder = map.get(current);
    if (!folder) break;
    crumbs.unshift({ id: folder._id, name: folder.name });
    current = folder.parentId!;
  }

  return crumbs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const dueCount = useDueCount();
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [flatFolders, setFlatFolders] = useState<FlatFolder[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch folders ───────────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/folders');
      const { data } = await res.json();
      if (data) {
        setFlatFolders(data);
        setFolderTree(buildTree(data));
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  }, []);

  // ── Fetch notes ─────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async (folderId: string | null) => {
    try {
      const url = folderId ? `/api/notes?folderId=${folderId}` : '/api/notes';
      const res = await fetch(url);
      const { data } = await res.json();
      if (data) setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchFolders(), fetchNotes(null)]).then(() => setIsLoading(false));
  }, [fetchFolders, fetchNotes]);

  // ── Folder selection ────────────────────────────────────────────────────────
  const handleSelectFolder = useCallback(
    (folderId: string | null) => {
      setActiveFolderId(folderId);
      fetchNotes(folderId);
    },
    [fetchNotes],
  );

  // ── Go back to parent folder ────────────────────────────────────────────────
  const handleGoBack = useCallback(() => {
    if (!activeFolderId) return;
    const current = flatFolders.find((f) => f._id === activeFolderId);
    const parentId = current?.parentId ?? null;
    setActiveFolderId(parentId);
    fetchNotes(parentId);
  }, [activeFolderId, flatFolders, fetchNotes]);

  // ── Create new note ─────────────────────────────────────────────────────────
  const handleNewNote = useCallback(async () => {
    const title = prompt('Note title:')?.trim();
    if (!title) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: activeFolderId,
          title,
        }),
      });
      const { data } = await res.json();
      if (data) {
        await fetchNotes(activeFolderId);
        router.push(`/notes/${data._id}`);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [activeFolderId, fetchNotes, router]);

  // ── Create new folder ───────────────────────────────────────────────────────
  const handleNewFolder = useCallback(
    async (parentId: string | null) => {
      const name = prompt('Folder name:');
      if (!name?.trim()) return;

      try {
        await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), parentId }),
        });
        await fetchFolders();
      } catch (err) {
        console.error('Failed to create folder:', err);
      }
    },
    [fetchFolders],
  );

  // ── Delete note ─────────────────────────────────────────────────────────────
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        await fetchNotes(activeFolderId);
        router.push('/notes');
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    },
    [activeFolderId, fetchNotes, router],
  );

  // ── Rename note ─────────────────────────────────────────────────────────────
  const handleRenameNote = useCallback(
    async (noteId: string, newTitle: string) => {
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        });
        await fetchNotes(activeFolderId);
      } catch (err) {
        console.error('Failed to rename note:', err);
      }
    },
    [activeFolderId, fetchNotes],
  );

  // ── Derived data ────────────────────────────────────────────────────────────
  const breadcrumb = buildBreadcrumb(activeFolderId, flatFolders);
  const activeFolderName = flatFolders.find((f) => f._id === activeFolderId)?.name;

  const filteredNotes = search.trim()
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ─── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2
          className="text-base font-semibold text-[#F0EDE6]/90"
          style={{ fontFamily: 'var(--font-caveat), cursive' }}
        >
          SquiggleNotes
        </h2>
      </div>

      {/* ── Search ─── */}
      <div className="px-3 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE6]/80 placeholder-[#F0EDE6]/25 outline-none focus:border-[#4F6EF7]/40 transition-colors"
        />
      </div>

      {/* ── New Note + New Folder buttons ─── */}
      <div className="px-3 pb-3 flex gap-1.5">
        <motion.button
          onClick={handleNewNote}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#4F6EF7] hover:bg-[#4F6EF7]/90 text-white text-sm font-medium rounded-lg py-2 transition-colors"
        >
          <span className="text-xs">+</span> New Note
        </motion.button>
        <motion.button
          onClick={() => handleNewFolder(activeFolderId)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-9 h-9 bg-white/[0.05] hover:bg-white/[0.08] text-[#F0EDE6]/50 text-sm rounded-lg transition-colors"
          title="New Folder"
        >
          📁
        </motion.button>
      </div>

      {/* ── Breadcrumb navigation ─── */}
      <AnimatePresence mode="wait">
        {activeFolderId ? (
          <motion.div
            key="breadcrumb"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="px-3 pb-2"
          >
            {/* Back button + breadcrumb trail */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-1 text-xs text-[#4F6EF7] hover:text-[#4F6EF7]/80 transition-colors flex-shrink-0"
              >
                <span className="text-[10px]">←</span>
                Back
              </button>

              <span className="text-[#F0EDE6]/15 text-[10px]">|</span>

              {/* Root */}
              <button
                onClick={() => handleSelectFolder(null)}
                className="text-[10px] text-[#F0EDE6]/30 hover:text-[#F0EDE6]/60 transition-colors"
              >
                All
              </button>

              {/* Trail */}
              {breadcrumb.map((crumb, i) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  <span className="text-[#F0EDE6]/15 text-[10px]">/</span>
                  <button
                    onClick={() => handleSelectFolder(crumb.id)}
                    className={cn(
                      'text-[10px] transition-colors truncate max-w-[80px]',
                      i === breadcrumb.length - 1
                        ? 'text-[#F0EDE6]/70 font-medium'
                        : 'text-[#F0EDE6]/30 hover:text-[#F0EDE6]/60',
                    )}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Folders ─── */}
      {folderTree.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium mb-1">
            Folders
          </p>
          <FolderTree
            folders={folderTree}
            activeFolderId={activeFolderId}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={handleNewFolder}
          />
        </div>
      )}

      {/* ── Divider ─── */}
      <div className="mx-3 border-t border-white/[0.04]" />

      {/* ── Notes list header ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium">
            {activeFolderName ? `${activeFolderName}` : 'All Notes'}{' '}
            {filteredNotes.length > 0 && `(${filteredNotes.length})`}
          </p>
          {activeFolderId && (
            <button
              onClick={() => handleSelectFolder(null)}
              className="text-[10px] text-[#F0EDE6]/30 hover:text-[#4F6EF7] transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-[#4F6EF7]/30 border-t-[#4F6EF7] rounded-full animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <p className="text-sm text-[#F0EDE6]/20 text-center py-6">
            {search ? 'No notes match your search' : 'No notes yet'}
          </p>
        ) : (
          <motion.div
            className="flex flex-col gap-0.5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <NoteListItem
                  id={note._id}
                  title={note.title}
                  updatedAt={note.updatedAt}
                  onDelete={handleDeleteNote}
                  onRename={handleRenameNote}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Footer ─── */}
      <div className="border-t border-white/[0.04] px-4 py-3 flex flex-col gap-3">
        <button
          onClick={() => router.push('/revision')}
          className="w-full flex items-center justify-between text-xs text-[#F5A623]/60 hover:text-[#F5A623] transition-colors"
        >
          <span>📖 Daily Revision →</span>
          {dueCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
              </span>
              <span className="bg-[#F5A623]/20 text-[#F5A623] text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                {dueCount}
              </span>
            </span>
          )}
        </button>

        {session?.user && (
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.04]">
            <span className="text-[10px] uppercase font-medium tracking-widest text-[#F0EDE6]/30">
              {session.user.name?.split(' ')[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-[10px] text-[#F0EDE6]/30 hover:text-[#FF453A] transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
