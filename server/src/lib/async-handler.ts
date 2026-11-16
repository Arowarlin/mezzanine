import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Express 5 ya captura promesas rechazadas, pero esto lo hace explícito y compatible con tests. */
export function asyncHandler(handler: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
