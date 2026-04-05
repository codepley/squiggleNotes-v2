import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { RevisionSession, Note } from '@/lib/db/schema';

// GET /api/revision/schedule — return all sessions due today
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const now = new Date();

    // 1. Get all notes owned by this user
    const userNotes = await Note.find({ userId: session.user.id }, '_id').lean();
    const noteIds = userNotes.map((n) => n._id);

    // 2. Fetch due sessions restricted to the user's notes
    const dueSessions = await RevisionSession.find({
      noteId: { $in: noteIds },
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
