import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { Folder } from '@/lib/db/schema';

// GET /api/folders — list all folders
export async function GET() {
  try {
    await connectDB();
    const result = await Folder.find().sort({ name: 1 }).lean();
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/folders — create folder
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, parentId } = await req.json();

    const folder = await Folder.create({
      name,
      parentId: parentId || null,
    });

    return NextResponse.json({ data: folder.toObject(), error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
