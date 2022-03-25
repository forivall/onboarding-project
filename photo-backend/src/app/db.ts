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
  createdBy: mongoose.Types.ObjectId;
  fileName?: string;
  data: Buffer;
  mimeType: string;
  // possible: thumbnail
}

const photoSchema = new mongoose.Schema<PhotoData>(
  {
    createdBy: mongoose.Types.ObjectId,
    fileName: String,
    data: { type: Buffer, required: true },
  },
  { autoCreate: true, timestamps: true }
);

export const PhotoModel = mongoose.model('Photo', photoSchema);

export interface UserInfoData {
  username: string;
  email: string;
}

/** DO !NOT! trust this design. I havent analyzed it for security and such */
export interface UserSecretData {
  salt: Buffer;
  key: Buffer;
}

export interface UserData
  extends MongooseTimestamps,
    UserInfoData,
    UserSecretData {}

const userSchema = new mongoose.Schema<UserData>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  salt: { type: Buffer, required: true },
  key: { type: Buffer, required: true },
});

export const UserModel = mongoose.model('User', userSchema);
