/**
 * /notes/[noteId] — Single note canvas view.
 * Fetches note data server-side, passes to NoteCanvas client component.
 */

import { connectDB } from '@/lib/db/client';
import { Note } from '@/lib/db/schema';
import { NoteCanvas } from '@/components/canvas/NoteCanvas';
import { notFound } from 'next/navigation';
import type { CanvasData } from '@/store/noteStore';

type PageProps = { params: Promise<{ noteId: string }> };

export default async function NoteCanvasPage({ params }: PageProps) {
  const { noteId } = await params;

  await connectDB();
  const note = await Note.findById(noteId).lean();

  if (!note) {
    notFound();
  }

  const canvasData = (note.canvasData as CanvasData) ?? null;

  return (
    <div className="relative h-full">
      <NoteCanvas
        noteId={noteId}
        initialCanvasData={canvasData}
        initialTitle={note.title}
        initialAudioUrl={note.audioFileUrl ?? null}
      />
    </div>
  );
}
