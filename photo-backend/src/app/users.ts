import * as crypto from 'crypto';
import createDebug from 'debug';
import { HydratedDocument } from 'mongoose';
import { createLoginToken, hashPassword, setPassword } from './auth';
import * as db from './db';
import { AsyncHandler } from './types';

const debug = createDebug('photo-backend:app:users');

interface RegisterUserRequest {
  email: string;
  username?: string;
  password: string;
}

export const register: AsyncHandler = async (req, res) => {
  if (typeof req.body !== 'object') {
    debug('register: no body');
    res.status(400).send();
    return;
  }
  const {
    email,
    username = email,
    password,
  } = req.body as Partial<RegisterUserRequest>;
  if (
    !email ||
    !password ||
    // TODO: use json-schema or something like it to verify bodies.
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof username !== 'string'
  ) {
    debug('register: invalid body');
    res.status(400).send();
    return;
  }
  const secrets = await setPassword(password);
  const userInfo = { email, username };
  let user: HydratedDocument<db.UserData>;
  try {
    user = await db.UserModel.create({
      ...userInfo,
      ...secrets,
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      debug('register: user exists');
      res.status(400).send();
      return;
    }
    debug('register: err %j', err);
    throw err;
  }
  const token = await createLoginToken(userInfo);
  res.status(201).send({
    token,
    user: {
      _id: user._id,
      ...userInfo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

export interface LoginRequest {
  email: string;
  password: string;
}

export const login: AsyncHandler = async (req, res) => {
  if (typeof req.body !== 'object') {
    res.status(400).send();
    return;
  }
  // Return 400 to all requests so no info is leaked
  const { email, password } = req.body as Partial<LoginRequest>;
  if (
    !email ||
    !password ||
    // TODO: use json-schema or something like it to verify bodies.
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    res.status(400).send();
    return;
  }
  const user = await db.UserModel.findOne({ email });
  if (!user) {
    res.status(400).send();
    return;
  }
  const key = await hashPassword(password, user.salt);
  if (!crypto.timingSafeEqual(key, user.key)) {
    res.status(400).send();
    return;
  }

  // Hacker voice: I'm in.
  const token = await createLoginToken(user);
  res.status(201).send({
    token,
    user: {
      // could use lodash.pick
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

// Logout is just clearing the jwt from sessionstorage
// Should add a revocation mechanism if rolling own user system.
