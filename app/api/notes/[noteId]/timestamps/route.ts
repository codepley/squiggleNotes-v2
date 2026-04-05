import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { TimestampLink } from '@/lib/db/schema';

type RouteParams = { params: Promise<{ noteId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId } = await params;

    const links = await TimestampLink.find({ noteId }).lean();

    return NextResponse.json({ data: links, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
