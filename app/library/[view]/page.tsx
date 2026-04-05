'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { NoteGrid } from '@/components/library/NoteGrid';
import type { NoteCardData } from '@/components/library/NoteCard';

type LibraryView = 'documents' | 'favourites' | 'trash' | 'shared';

const VIEW_LABELS: Record<LibraryView, { title: string; subtitle: string }> = {
    documents: { title: 'All Documents', subtitle: 'Every note you\'ve created' },
    favourites: { title: 'Favourites', subtitle: 'Notes you\'ve starred' },
    shared: { title: 'Shared', subtitle: 'Notes shared with others' },
    trash: { title: 'Trash', subtitle: 'Deleted notes — restore or remove permanently' },
};

export default function LibraryViewPage() {
    const params = useParams();
    const viewParam = params?.view as string;

    const validViews: LibraryView[] = ['documents', 'favourites', 'trash', 'shared'];
    const currentView = validViews.includes(viewParam as LibraryView)
        ? (viewParam as LibraryView)
        : 'documents';

    const [notes, setNotes] = useState<NoteCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/library?view=${currentView}`);
            const result = await res.json();
            if (result.data) {
                setNotes(result.data);
            } else {
                setNotes([]);
            }
        } catch {
            setNotes([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentView]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const label = VIEW_LABELS[currentView] ?? VIEW_LABELS.documents;

    return (
        <div className="min-h-full bg-[#0E0E0F] px-8 py-8">
            <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#F0EDE6]/90 mb-1">{label.title}</h1>
                        <p className="text-sm text-[#F0EDE6]/30">{label.subtitle}</p>
                    </div>

                    <button
                        onClick={fetchNotes}
                        className="p-2 text-[#F0EDE6]/20 hover:text-[#4F6EF7] transition-colors rounded-lg bg-white/[0.02] border border-white/[0.04]"
                        title="Refresh"
                    >
                        🔄
                    </button>
                </div>

                {!isLoading && notes.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                        <span className="inline-block text-xs text-[#F5A623]/70 bg-[#F5A623]/10 px-2.5 py-1 rounded-full">
                            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                        </span>
                    </div>
                )}
            </motion.div>

            <div className="border-t border-white/[0.05] mb-6" />

            <NoteGrid
                notes={notes}
                view={currentView}
                isLoading={isLoading}
                onRefresh={fetchNotes}
            />
        </div>
    );
}
