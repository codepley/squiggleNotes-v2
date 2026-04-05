import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { Folder } from '@/lib/db/schema';

// GET /api/folders — list all folders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const result = await Folder.find({ userId: session.user.id }).sort({ name: 1 }).lean();
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/folders — create folder
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, parentId } = await req.json();

    const folder = await Folder.create({
      userId: session.user.id,
      name,
      parentId: parentId || null,
    });

    return NextResponse.json({ data: folder.toObject(), error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
