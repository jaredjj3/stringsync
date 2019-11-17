import { ForbiddenError } from 'apollo-server';
import { createRawUserSession, toCanonicalUser } from '../../db';
import {
  setUserSessionTokenCookie,
  shouldRefreshUserSession,
} from '../../user-session';
import { RequestContext } from '../../request-context';

interface Args {}

const BAD_SESSION_TOKEN_MSG = 'invalid or expired credentials';

export const reauthResolver = async (
  parent: undefined,
  args: Args,
  ctx: RequestContext
) => {
  const { isLoggedIn, user, token } = ctx.auth;

  if (!isLoggedIn || !user || !token) {
    throw new ForbiddenError(BAD_SESSION_TOKEN_MSG);
  }

  return ctx.db.transaction(async (transaction) => {
    const oldUserSession = await ctx.db.models.UserSession.findOne({
      where: { token },
      transaction,
    });
    if (!oldUserSession) {
      throw new ForbiddenError(BAD_SESSION_TOKEN_MSG);
    }

    if (shouldRefreshUserSession(ctx.requestedAt, oldUserSession.issuedAt)) {
      await oldUserSession.destroy({ transaction });
      const userSessionModel = await createRawUserSession(
        ctx.db,
        user.id,
        ctx.requestedAt
      );
      setUserSessionTokenCookie(userSessionModel, ctx.res);
    }

    return { user: toCanonicalUser(user) };
  });
};
