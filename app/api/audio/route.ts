import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { connectDB } from '@/lib/db/client';
import { Note } from '@/lib/db/schema';

// POST /api/audio — receive audio blob, save locally, update note
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    const noteId = formData.get('noteId') as string | null;

    if (!audio || !noteId) {
      return NextResponse.json({ data: null, error: 'Missing audio or noteId' }, { status: 400 });
    }

    // Save audio file to public/audio/ (serves statically)
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await mkdir(audioDir, { recursive: true });

    const filename = `${noteId}-${Date.now()}.webm`;
    const filePath = path.join(audioDir, filename);
    const buffer = Buffer.from(await audio.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/audio/${filename}`;

    // Update the note with the audio URL
    await connectDB();
    await Note.findByIdAndUpdate(noteId, {
      $set: {
        audioFileUrl: url,
        audioDurationSeconds: null, // can be computed client-side later
      },
    });

    return NextResponse.json({ data: { url }, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
