import mongoose from 'mongoose';
import { Note } from './lib/db/schema';
import { connectDB } from './lib/db/client';

async function check() {
  try {
    await connectDB();
    const count = await Note.countDocuments({});
    const notes = await Note.find({}).limit(5).lean();
    console.log('Total notes:', count);
    console.log('Sample notes:', JSON.stringify(notes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
