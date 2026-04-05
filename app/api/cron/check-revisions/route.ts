import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { RevisionSession, Note } from '@/lib/db/schema';

/**
 * GET /api/cron/check-revisions
 *
 * Cron-compatible endpoint that checks for overdue revision sessions.
 * Deploy with Vercel Cron Jobs to run daily at 8AM:
 *
 *   vercel.json:
 *   { "crons": [{ "path": "/api/cron/check-revisions", "schedule": "0 8 * * *" }] }
 *
 * MVP: Returns due sessions count + auto-creates missing sessions for notes
 *      that have generated content but no active revision session.
 * V2:  Send push notifications via web-push.
 */
export async function GET(req: NextRequest) {
  // Optional: Verify cron secret header for security
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();

    // 1. Find all due sessions
    const dueSessions = await RevisionSession.find({
      nextDue: { $lte: now },
      completedAt: null,
    }).lean();

    // 2. Find notes with generated content but NO active revision session
    //    (notes that slipped through — e.g., content was generated before
    //     auto-scheduling was added)
    const activeSessionNoteIds = await RevisionSession.distinct('noteId', {
      completedAt: null,
    });

    const orphanNotes = await Note.aggregate([
      {
        $lookup: {
          from: 'generatedcontents',
          localField: '_id',
          foreignField: 'noteId',
          as: 'content',
        },
      },
      {
        $match: {
          'content.0': { $exists: true },
          _id: { $nin: activeSessionNoteIds },
        },
      },
      {
        $project: { _id: 1, title: 1 },
      },
    ]);

    // 3. Auto-create sessions for orphan notes
    let newSessionsCreated = 0;
    for (const note of orphanNotes) {
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 1);

      await RevisionSession.create({
        noteId: note._id,
        scheduledAt: new Date(),
        nextDue,
        intervalDays: 1,
      });
      newSessionsCreated++;
    }

    return NextResponse.json({
      data: {
        dueSessions: dueSessions.length,
        newSessionsCreated,
        checkedAt: now.toISOString(),
      },
      error: null,
    });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
