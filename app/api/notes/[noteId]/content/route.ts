import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { GeneratedContent } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ noteId: string }> };

// GET /api/notes/[noteId]/content — get all generated content for a note
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { noteId } = await params;

    const content = await GeneratedContent.find({ noteId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: content, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
