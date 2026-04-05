'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NoteCardData {
    _id: string;
    title: string;
    folderId?: string | null;
    isFavourite: boolean;
    isDeleted: boolean;
    deletedAt?: string | null;
    sharedWith?: string[];
    updatedAt: string;
    audioFileUrl?: string | null;
}

interface NoteCardProps {
    note: NoteCardData;
    view: 'documents' | 'favourites' | 'trash' | 'shared';
    onRefresh: () => void;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export function NoteCard({ note, view, onRefresh }: NoteCardProps) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [optimisticFav, setOptimisticFav] = useState(note.isFavourite);
    const menuRef = useRef<HTMLDivElement>(null);

    // Sync if parent note changes
    useEffect(() => { setOptimisticFav(note.isFavourite); }, [note.isFavourite]);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const patch = async (payload: object) => {
        setLoading(true);
        await fetch(`/api/notes/${note._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        setLoading(false);
        onRefresh();
    };

    const handleToggleFavourite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setOptimisticFav((f) => !f); // optimistic update
        await patch({ isFavourite: !optimisticFav });
    };

    const handleTrash = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        await patch({ isDeleted: true, deletedAt: new Date().toISOString() });
    };

    const handleRestore = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await patch({ isDeleted: false, deletedAt: null });
    };

    const handlePermanentDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Permanently delete "${note.title}"? This cannot be undone.`)) return;
        setLoading(true);
        await fetch(`/api/notes/${note._id}/permanent`, { method: 'DELETE' });
        setLoading(false);
        onRefresh();
    };

    const handleCardClick = () => {
        if (!note.isDeleted) router.push(`/notes/${note._id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={handleCardClick}
            className={cn(
                'relative flex flex-col bg-[#161618] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer',
                note.isDeleted && 'opacity-60 cursor-default',
                loading && 'pointer-events-none opacity-40',
                optimisticFav && 'ring-1 ring-[#F5A623]/25',
            )}
        >
            {/* Top colour bar — amber if favourite */}
            <div
                className={cn(
                    'h-0.5 w-full transition-colors duration-300',
                    optimisticFav ? 'bg-[#F5A623]' : 'bg-transparent',
                )}
            />

            {/* Card body */}
            <div className="px-4 pt-3 pb-2 flex-1">
                {/* Title */}
                <h3 className="text-sm font-medium text-[#F0EDE6]/85 leading-snug line-clamp-2 mb-2">
                    {note.title}
                </h3>

                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap min-h-[18px]">
                    {note.audioFileUrl && (
                        <span className="text-[10px] text-[#F0EDE6]/30 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                            🎙️ Audio
                        </span>
                    )}
                    {note.sharedWith && note.sharedWith.length > 0 && (
                        <span className="text-[10px] text-[#4F6EF7]/60 bg-[#4F6EF7]/10 px-1.5 py-0.5 rounded-md">
                            👥 Shared
                        </span>
                    )}
                    {note.isDeleted && note.deletedAt && (
                        <span className="text-[10px] text-[#FF453A]/50">
                            Trashed {timeAgo(note.deletedAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer — always visible action buttons */}
            <div
                className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Updated time */}
                <span className="text-[10px] text-[#F0EDE6]/20">
                    {note.isDeleted ? 'In Trash' : timeAgo(note.updatedAt)}
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    {!note.isDeleted && (
                        <>
                            {/* ⭐ Favourite toggle — always visible */}
                            <motion.button
                                whileTap={{ scale: 0.75 }}
                                title={optimisticFav ? 'Remove from favourites' : 'Add to favourites'}
                                onClick={handleToggleFavourite}
                                className={cn(
                                    'w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors',
                                    optimisticFav
                                        ? 'text-[#F5A623]'
                                        : 'text-[#F0EDE6]/25 hover:text-[#F5A623] hover:bg-[#F5A623]/10',
                                )}
                            >
                                {optimisticFav ? '⭐' : '☆'}
                            </motion.button>

                            {/* 🗑️ Trash — always visible */}
                            <motion.button
                                whileTap={{ scale: 0.75 }}
                                title="Move to Trash"
                                onClick={handleTrash}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#F0EDE6]/20 hover:text-[#FF453A] hover:bg-[#FF453A]/10 text-sm transition-colors"
                            >
                                🗑️
                            </motion.button>
                        </>
                    )}

                    {/* Trash view: restore + permanent delete */}
                    {note.isDeleted && (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                title="Restore note"
                                onClick={handleRestore}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#30D158]/60 hover:text-[#30D158] hover:bg-[#30D158]/10 text-sm transition-colors"
                            >
                                ↩️
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                title="Delete permanently"
                                onClick={handlePermanentDelete}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#FF453A]/40 hover:text-[#FF453A] hover:bg-[#FF453A]/10 text-sm transition-colors"
                            >
                                💀
                            </motion.button>
                        </>
                    )}

                    {/* Open note (non-trash views) */}
                    {!note.isDeleted && (
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            title="Open note"
                            onClick={(e) => { e.stopPropagation(); router.push(`/notes/${note._id}`); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#4F6EF7]/40 hover:text-[#4F6EF7] hover:bg-[#4F6EF7]/10 text-sm transition-colors"
                        >
                            →
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
