import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Folder, Note } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ folderId: string }> };

// PATCH /api/folders/[folderId] — rename folder
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { folderId } = await params;
    const { name } = await req.json();

    const updated = await Folder.findByIdAndUpdate(
      folderId,
      { $set: { name } },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ data: null, error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/folders/[folderId] — delete folder + cascade notes
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { folderId } = await params;

    // Cascade: delete all notes in this folder
    await Note.deleteMany({ folderId });
    await Folder.findByIdAndDelete(folderId);

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
