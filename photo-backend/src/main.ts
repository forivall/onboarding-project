import express from 'express';
import createDebug from 'debug';
import dotenv from 'dotenv-defaults';

dotenv.config({
  path: __dirname + '/../../.env',
  defaults: __dirname + '/../../.env.defaults',
});
createDebug.enable(process.env.DEBUG);

// NOTE: in a production app, a full logger should be used.
const debug = createDebug('photo-backend:main');

debug('MONGODB_URI: %s', process.env.MONGODB_URI);
const port = Number(process.env.API_PORT);

const app = express();

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.listen(port, () => {
  debug('API server listening on %d', port);
});
