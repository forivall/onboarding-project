import type express from 'express';
import multer from 'multer';
import createDebug from 'debug';

import * as db from './db';

const debug = createDebug('photo-backend:photos');

/** Mongodb's document limit is 16MB, so we set our filesize limit to 15MB */
const fifteenMegabytes = 15 << 20; // eslint-disable-line no-bitwise

type AsyncRequestHandler<
  P = import('express-serve-static-core').ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = import('express-serve-static-core').Query,
  Locals extends { [key: string]: any } = { [key: string]: any }
> = {
  (
    ...args: Parameters<
      express.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
    >
  ): void | Promise<void>;
  middleware?: express.RequestHandler[];
};

export const create: AsyncRequestHandler = async (req, res) => {
  const { file } = req;
  if (!file || !file.mimetype.startsWith('image/')) {
    res.status(400).send({
      message: 'Invalid file upload.',
    });
    return;
  }

  const photo = await db.PhotoModel.create({
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

export const read: AsyncRequestHandler<{ id: string }> = async (req, res) => {
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
export const list: AsyncRequestHandler = async (req, res) => {
  const photos = await db.PhotoModel.find({}, { data: false });
  res.status(200).send({
    items: photos.map((it) => it.toJSON()),
  });
};

export const del: AsyncRequestHandler = async (req, res) => {
  const photo = await db.PhotoModel.findByIdAndRemove(req.params.id, {
    projection: { data: false },
  });
  debug('delete photo %o', photo);
  if (!photo) {
    res.status(404).send();
    return;
  }
  res.status(200).send();
};
