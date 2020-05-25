import { Middleware } from './types';

export const withTransaction: Middleware<any, any, any> = (next) => (
  src,
  args,
  rctx,
  info
) => {
  return rctx.db.transaction(async () => await next(src, args, rctx, info));
};
