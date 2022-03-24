import 'source-map-support/register';

import express from 'express';
import createDebug from 'debug';
import dotenv from 'dotenv-defaults';
import asyncHandler from 'express-async-handler';
import morgan from 'morgan';
import passport from 'passport';

dotenv.config({
  path: __dirname + '/../../.env',
  defaults: __dirname + '/../../.env.defaults',
});
createDebug.enable(process.env.DEBUG);

// import local after dotenv set up.
import {
  anonymousStrategy,
  bearerStrategy,
  isLoggedInMiddleware,
} from './app/auth';
import * as db from './app/db';
import * as photos from './app/photos';
import * as users from './app/users';

// NOTE: in a production app, a full logger should be used.
const debug = createDebug('photo-backend:main');

const port = Number(process.env.API_PORT);

const app = express();

passport.use(bearerStrategy);
passport.use(anonymousStrategy);
const authMiddleware = passport.authenticate('bearer', {
  session: false,
}) as express.Handler;
const optionalAuthMiddleware = passport.authenticate(['bearer', 'anonymous'], {
  session: false,
}) as express.Handler;

const logging = morgan('dev'); // I prefer pino, but it's annoying in dev
app.use(logging);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.post('/api/user/login', asyncHandler(users.login));
app.post('/api/user/register', asyncHandler(users.register));

app.post(
  '/api/photos',
  authMiddleware,
  ...photos.create.middleware!,
  asyncHandler(photos.create)
);
app.get('/api/photos/:id', optionalAuthMiddleware, asyncHandler(photos.read));
app.get(
  '/api/photos',
  optionalAuthMiddleware,
  asyncHandler(isLoggedInMiddleware),
  asyncHandler(photos.list)
);
app.delete('/api/photos/:id', authMiddleware, asyncHandler(photos.del));

let server: import('http').Server;
async function start() {
  await db.connect();
  await new Promise<void>((resolve) => {
    server = app.listen(port, resolve);
  });
  debug('API server listening on %d', port);
}

async function stop() {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  await db.connection.close();
}

start().catch((err) => {
  debug('Error on startup:', err.stack || err);
  process.exitCode = 1;
  stop().catch((err2) => {
    debug('Error on shutdown!', err2.stack || err2);
    setTimeout(() => {
      process.exit(2);
    }, 100);
  });
});
