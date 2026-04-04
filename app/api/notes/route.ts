import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Note, RevisionSession } from '@/lib/db/schema';

// GET /api/notes?folderId=<id>
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    const filter = folderId ? { folderId } : {};
    const result = await Note.find(filter).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/notes — create a new note
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { folderId, title } = body;

    const note = await Note.create({
      folderId: folderId || null,
      title: title ?? 'Untitled Note',
      canvasData: { strokes: [], textBlocks: [] },
    });

    // Schedule first revision session (24h from now)
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 24);

    await RevisionSession.create({
      noteId: note._id,
      scheduledAt,
      nextDue: scheduledAt,
      intervalDays: 1,
    });

    return NextResponse.json({ data: note.toObject(), error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
