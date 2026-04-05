import mongoose from 'mongoose';
import { Note } from './lib/db/schema';

async function check() {
  try {
    const MONGODB_URI = "mongodb+srv://officialkushalkaran_db_user:tIZzzIKN6FCiRwYR@cluster0.tjwzfe0.mongodb.net/squigglenotes?retryWrites=true&w=majority";
    await mongoose.connect(MONGODB_URI);
    const count = await Note.countDocuments({});
    const notes = await Note.find({}).limit(10).select('_id userId title isDeleted isFavourite').lean();
    console.log('Total notes in DB:', count);
    console.log('Sample notes:', JSON.stringify(notes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
