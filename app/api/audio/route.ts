import { NextRequest, NextResponse } from 'next/server';

// POST /api/audio — receive audio blob, store, return URL
// NOTE: In production, upload to Vercel Blob / S3. This stub returns a placeholder URL.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    const noteId = formData.get('noteId') as string | null;

    if (!audio || !noteId) {
      return NextResponse.json({ data: null, error: 'Missing audio or noteId' }, { status: 400 });
    }

    // TODO: Upload blob to storage provider (Vercel Blob / S3)
    // const url = await uploadToStorage(audio, `audio/${noteId}.webm`);
    const url = `/audio/${noteId}.webm`; // placeholder — replace with real upload

    return NextResponse.json({ data: { url }, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
