import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { Note, TimestampLink } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ noteId: string }> };

// GET /api/notes/[noteId]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId } = await params;

    const note = await Note.findOne({ _id: noteId, userId: session.user.id }).lean();
    if (!note) {
      return NextResponse.json({ data: null, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ data: note, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/notes/[noteId] — autosave canvasData
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId } = await params;
    const body = await req.json();

    const updateFields: Record<string, unknown> = {};
    if (body.canvasData !== undefined) updateFields.canvasData = body.canvasData;
    if (body.title !== undefined) updateFields.title = body.title;

    const updated = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      { $set: updateFields },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ data: null, error: 'Note not found' }, { status: 404 });
    }

    if (body.pendingTimestamps && Array.isArray(body.pendingTimestamps) && body.pendingTimestamps.length > 0) {
      const linksToInsert = body.pendingTimestamps.map((pt: any) => ({
        noteId,
        canvasElementId: pt.elementId,
        audioOffsetSeconds: pt.offset,
      }));
      await TimestampLink.insertMany(linksToInsert);
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/notes/[noteId]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId } = await params;

    const deleted = await Note.findOneAndDelete({ _id: noteId, userId: session.user.id });
    if (!deleted) {
      return NextResponse.json({ data: null, error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
