import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Note, GeneratedContent, RevisionSession } from '@/lib/db/schema';
import { extractAndGenerate } from '@/lib/ai/generator';
import type { CanvasData } from '@/store/noteStore';

// POST /api/generate — generate content for a note
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { noteId } = await req.json();

    const note = await Note.findById(noteId).lean();
    if (!note) {
      return NextResponse.json({ data: null, error: 'Note not found' }, { status: 404 });
    }

    const canvasData = note.canvasData as CanvasData | null;
    if (!canvasData) {
      return NextResponse.json({ data: [], error: null });
    }

    const items = await extractAndGenerate(canvasData);

    // Persist generated content
    const docs = await GeneratedContent.insertMany(
      items.map((item) => ({
        noteId,
        type: item.type,
        payload: {
          question: item.question,
          answer: item.answer,
          options: item.options,
          blankedSentence: item.blankedSentence,
        },
      })),
    );

    // Auto-schedule revision (due in 24h) if no active session exists
    const existingSession = await RevisionSession.findOne({
      noteId,
      completedAt: null,
    });

    if (!existingSession && docs.length > 0) {
      const scheduledAt = new Date();
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 1);

      await RevisionSession.create({
        noteId,
        scheduledAt,
        nextDue,
        intervalDays: 1,
      });
    }

    return NextResponse.json({ data: docs, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
