'use client';

/**
 * Sidebar — folder tree + search bar + "New Note" / "New Folder" buttons + note list.
 * Main navigation component for the /notes/* routes.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FolderTree, type FolderNode } from './FolderTree';
import { NoteListItem } from './NoteListItem';

interface NoteItem {
  _id: string;
  title: string;
  updatedAt: string;
}

// ─── Build tree from flat folder list ─────────────────────────────────────────

function buildTree(folders: { _id: string; name: string; parentId: string | null }[]): FolderNode[] {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch folders ───────────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/folders');
      const { data } = await res.json();
      if (data) setFolders(buildTree(data));
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

  // ── Create new note ─────────────────────────────────────────────────────────
  const handleNewNote = useCallback(async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: activeFolderId,
          title: 'Untitled Note',
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

  // ── Filtered notes ──────────────────────────────────────────────────────────
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

      {/* ── Folders ─── */}
      {folders.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium">
              Folders
            </p>
            <button
              onClick={() => {
                setActiveFolderId(null);
                fetchNotes(null);
              }}
              className={cn(
                'text-[10px] transition-colors',
                activeFolderId === null
                  ? 'text-[#4F6EF7]'
                  : 'text-[#F0EDE6]/30 hover:text-[#F0EDE6]/50',
              )}
            >
              All Notes
            </button>
          </div>
          <FolderTree
            folders={folders}
            activeFolderId={activeFolderId}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={handleNewFolder}
          />
        </div>
      )}

      {/* ── Divider ─── */}
      <div className="mx-3 border-t border-white/[0.04]" />

      {/* ── Notes list ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium mb-2">
          Notes {filteredNotes.length > 0 && `(${filteredNotes.length})`}
        </p>

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
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Footer ─── */}
      <div className="border-t border-white/[0.04] px-4 py-2">
        <button
          onClick={() => router.push('/revision')}
          className="w-full text-left text-xs text-[#F5A623]/60 hover:text-[#F5A623] transition-colors"
        >
          📖 Daily Revision →
        </button>
      </div>
    </div>
  );
}

// ─── cn import helper (used inline) ───────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
