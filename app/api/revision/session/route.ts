import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { RevisionSession, RevisionResponse, Note } from '@/lib/db/schema';
import { getNextInterval, computeNextDue, type Rating } from '@/lib/spaced-repetition/scheduler';

const RATING_MAP: Record<string, Rating> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

// POST /api/revision/session — create new session for a note
export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession || !authSession.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId } = await req.json();

    // Verify ownership
    const note = await Note.findOne({ _id: noteId, userId: authSession.user.id }).lean();
    if (!note) {
      return NextResponse.json({ data: null, error: 'Note not found or unauthorized' }, { status: 404 });
    }

    const scheduledAt = new Date();
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 1);

    const session = await RevisionSession.create({
      noteId,
      scheduledAt,
      nextDue,
      intervalDays: 1,
    });

    return NextResponse.json({ data: session.toObject(), error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/revision/session — submit rating, compute next interval
export async function PATCH(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession || !authSession.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { sessionId, contentId, rating: ratingStr } = await req.json();
    const rating = RATING_MAP[ratingStr as string];

    if (rating === undefined) {
      return NextResponse.json({ data: null, error: 'Invalid rating' }, { status: 400 });
    }

    // Fetch current session
    const session = await RevisionSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ data: null, error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership of the Note to which this session belongs
    const note = await Note.findOne({ _id: session.noteId, userId: authSession.user.id }).lean();
    if (!note) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    // Record response
    await RevisionResponse.create({
      sessionId,
      contentId,
      rating: ratingStr,
    });

    // Compute next interval
    const { nextIntervalDays, newEaseFactor, newRepetition } = getNextInterval(
      session.repetitionCount,
      session.easeFactor,
      rating,
    );

    const nextDue = computeNextDue(nextIntervalDays);

    // Update session
    const updated = await RevisionSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          intervalDays: nextIntervalDays,
          nextDue,
          easeFactor: newEaseFactor,
          repetitionCount: newRepetition,
          completedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
