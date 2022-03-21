import express from 'express';
import dotenv from 'dotenv-defaults';

dotenv.config({
  path: __dirname + '/../../.env',
  defaults: __dirname + '/../../.env.defaults',
});

console.log(process.env.MONGODB_URI);

const app = express();

app.listen();
