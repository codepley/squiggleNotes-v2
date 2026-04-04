import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Note } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ noteId: string }> };

// GET /api/notes/[noteId]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { noteId } = await params;

    const note = await Note.findById(noteId).lean();
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
    await connectDB();
    const { noteId } = await params;
    const body = await req.json();

    const updateFields: Record<string, unknown> = {};
    if (body.canvasData !== undefined) updateFields.canvasData = body.canvasData;
    if (body.title !== undefined) updateFields.title = body.title;

    const updated = await Note.findByIdAndUpdate(
      noteId,
      { $set: updateFields },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ data: null, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/notes/[noteId]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { noteId } = await params;

    await Note.findByIdAndDelete(noteId);

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
