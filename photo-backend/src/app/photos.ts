import multer from 'multer';
import createDebug from 'debug';

import * as db from './db';
import { AsyncHandler } from './types';

const debug = createDebug('photo-backend:photos');

/** Mongodb's document limit is 16MB, so we set our filesize limit to 15MB */
const fifteenMegabytes = 15 << 20; // eslint-disable-line no-bitwise

export const create: AsyncHandler = async (req, res) => {
  const { file, user } = req;
  const userId = user?.sub;
  if (!userId) {
    res.status(401).send();
    return;
  }
  if (!file || !file.mimetype.startsWith('image/')) {
    res.status(400).send({
      message: 'Invalid file upload.',
    });
    return;
  }

  const photo = await db.PhotoModel.create({
    createdBy: userId,
    data: file.buffer,
    fileName: file.originalname,
  });
  // probably use lodash instead
  const { data: _omitted, ...photoJson } = photo.toJSON();
  res.status(201).send(photoJson);
};
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: fifteenMegabytes } });
create.middleware = [upload.single('file')];

/**
 * If authentication is required, cookie auth should be supported for
 * browser-oriented requests (ie. <img> tags)
 */
export const read: AsyncHandler<{ id: string }> = async (req, res) => {
  const photo = await db.PhotoModel.findById(req.params.id);
  if (!photo) {
    res.status(404).send();
    return;
  }

  let disposition = req.query.download ? 'attachment' : 'inline';
  if (photo.fileName) {
    disposition += `; filename=${JSON.stringify(photo.fileName)}`;
  }

  res.status(200).set('Content-Disposition', disposition).send(photo.data);
};
export const list: AsyncHandler = async (req, res) => {
  const photos = await db.PhotoModel.find({}, { data: false });
  res.status(200).send({
    items: photos.map((it) => it.toJSON()),
  });
};

export const del: AsyncHandler = async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).send();
    return;
  }
  // Use remove instead of delete so we can return 404 if doesnt exist.
  const photo = await db.PhotoModel.findOneAndRemove(
    {
      _id: req.params.id,
      createdBy: { $in: [userId, null] },
    },
    {
      projection: { data: false },
    }
  );
  debug('delete photo %o', photo);
  if (!photo) {
    res.status(404).send();
    return;
  }
  res.status(200).send();
};
