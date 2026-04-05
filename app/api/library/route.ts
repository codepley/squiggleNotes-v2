import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/client';
import { Note } from '@/lib/db/schema';
import mongoose from 'mongoose';

type LibraryView = 'documents' | 'favourites' | 'trash' | 'shared';

// GET /api/library?view=documents|favourites|trash|shared
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const view = (searchParams.get('view') ?? 'documents') as LibraryView;

        // Filter by authenticated userId
        const userId = new mongoose.Types.ObjectId(session.user.id);
        const filter: any = { userId };

        if (view === 'documents') {
            filter.isDeleted = { $ne: true };
        } else if (view === 'favourites') {
            filter.isFavourite = true;
            filter.isDeleted = { $ne: true };
        } else if (view === 'trash') {
            filter.isDeleted = true;
        } else if (view === 'shared') {
            filter['sharedWith.0'] = { $exists: true };
            filter.isDeleted = { $ne: true };
        }

        const notes = await Note.find(filter)
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ data: notes, error: null });
    } catch (err) {
        return NextResponse.json(
            { data: null, error: (err as Error).message },
            { status: 500 },
        );
    }
}
