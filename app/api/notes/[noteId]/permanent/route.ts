import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Note } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ noteId: string }> };

// DELETE /api/notes/[noteId]/permanent — hard delete from trash
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { noteId } = await params;

        const deleted = await Note.findOneAndDelete({ _id: noteId, isDeleted: true });
        if (!deleted) {
            return NextResponse.json(
                { data: null, error: 'Note not found in trash' },
                { status: 404 },
            );
        }

        return NextResponse.json({ data: { deleted: true }, error: null });
    } catch (err) {
        return NextResponse.json(
            { data: null, error: (err as Error).message },
            { status: 500 },
        );
    }
}
