'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { NoteCard, type NoteCardData } from './NoteCard';

const EMPTY_STATES: Record<string, { icon: string; title: string; body: string }> = {
    documents: { icon: '📄', title: 'No notes yet', body: 'Create your first note from the Notes section.' },
    favourites: { icon: '⭐', title: 'No favourites', body: 'Star a note to find it here quickly.' },
    shared: { icon: '👥', title: 'Nothing shared', body: 'Notes you share with others will appear here.' },
    trash: { icon: '🗑️', title: 'Trash is empty', body: 'Deleted notes will appear here before being permanently removed.' },
};

interface NoteGridProps {
    notes: NoteCardData[];
    view: 'documents' | 'favourites' | 'trash' | 'shared';
    isLoading: boolean;
    onRefresh: () => void;
}

export function NoteGrid({ notes, view, isLoading, onRefresh }: NoteGridProps) {
    const empty = EMPTY_STATES[view] ?? EMPTY_STATES.documents;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
            >
                <span className="text-5xl mb-4">{empty.icon}</span>
                <h3 className="text-base font-medium text-[#F0EDE6]/50 mb-1">{empty.title}</h3>
                <p className="text-sm text-[#F0EDE6]/25 max-w-xs">{empty.body}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                    <NoteCard key={note._id} note={note} view={view} onRefresh={onRefresh} />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
