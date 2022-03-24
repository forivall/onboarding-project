import type express from 'express';

export type AsyncHandler<
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
