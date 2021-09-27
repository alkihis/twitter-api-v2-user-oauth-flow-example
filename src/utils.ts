import type { Request, Response, RequestHandler, NextFunction } from 'express';

export function asyncWrapOrError(callback: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise
      .resolve(callback(req, res, next))
      .catch(err => err ? next(err) : next(new Error('Unknown error.')));
  };
}
