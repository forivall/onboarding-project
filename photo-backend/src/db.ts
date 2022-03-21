/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from 'mongoose';
import createDebug from 'debug';

const debug = createDebug('photo-backend:db');
export async function connect() {
  const { MONGODB_URI } = process.env;
  debug('MONGODB_URI: %s', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
}
export { connection } from 'mongoose';

export interface MongooseTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoData extends MongooseTimestamps {
  fileName?: string;
  data: Buffer;
  mimeType: string;
  // possible: thumbnail
}

const photoSchema = new mongoose.Schema<PhotoData>(
  {
    fileName: String,
    data: { type: Buffer, required: true },
  },
  { autoCreate: true, timestamps: true }
);

export const PhotoModel = mongoose.model('Photo', photoSchema);
