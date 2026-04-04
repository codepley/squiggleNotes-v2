import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { RevisionSession } from '@/lib/db/schema';

// GET /api/revision/schedule — return all sessions due today
export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const dueSessions = await RevisionSession.find({
      nextDue: { $lte: now },
      completedAt: null,
    })
      .populate('noteId', 'title')
      .lean();

    // Reshape for frontend
    const data = dueSessions.map((s) => ({
      id: s._id,
      noteId: (s.noteId as any)?._id ?? s.noteId,
      noteTitle: (s.noteId as any)?.title ?? 'Untitled Note',
      scheduledAt: s.scheduledAt,
      nextDue: s.nextDue,
      intervalDays: s.intervalDays,
      repetitionCount: s.repetitionCount,
      easeFactor: s.easeFactor,
    }));

    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
