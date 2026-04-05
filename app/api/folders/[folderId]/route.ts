import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { Folder, Note } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ folderId: string }> };

// PATCH /api/folders/[folderId] — rename folder
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { folderId } = await params;
    const { name } = await req.json();

    const updated = await Folder.findOneAndUpdate(
      { _id: folderId, userId: session.user.id },
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { folderId } = await params;

    // Verify ownership
    const folder = await Folder.findOne({ _id: folderId, userId: session.user.id });
    if (!folder) {
      return NextResponse.json({ data: null, error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    // Cascade: delete all notes in this folder that belong to the user
    await Note.deleteMany({ folderId, userId: session.user.id });
    await Folder.findByIdAndDelete(folderId);

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
