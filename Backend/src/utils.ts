import { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not await async handlers, so a rejected promise becomes an
// unhandled rejection instead of reaching the error middleware. Wrap every
// async route with this so DB errors are forwarded to next().
export function ah<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
}
