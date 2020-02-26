import { login } from './login';
import { LoginInput } from '../../../common/types';
import { getFixtures, useTestReqCtx } from '../../../testing';

const USER1 = getFixtures().User.student1;
const PASSWORD = 'password'; // decrypted password from fixtures file

it.each([USER1.email, USER1.username])(
  'returns the user if the username and password is correct',
  useTestReqCtx(
    { fixtures: { User: [USER1] } },
    async (ctx, emailOrUsername) => {
      const { UserSession } = ctx.db.models;
      expect(await UserSession.count()).toBe(0);

      const input: LoginInput = {
        emailOrUsername,
        password: PASSWORD,
      };
      const { user } = await login(undefined, { input }, ctx);

      expect(await UserSession.count()).toBe(1);
      const createdUserSession = await UserSession.findOne();
      expect(createdUserSession).not.toBeNull();
      expect(createdUserSession!.userId).toBe(USER1.id);
      expect(user).not.toBeNull();
      expect(user!.id).toBe(USER1.id);
    }
  )
);

it(
  'throws an error if the user does not exist',
  useTestReqCtx({}, async (ctx) => {
    const input: LoginInput = {
      emailOrUsername: USER1.email,
      password: PASSWORD,
    };

    await expect(login(undefined, { input }, ctx)).rejects.toThrowError(
      'wrong username, email, or password'
    );
  })
);

it(
  'throws an error is the password is wrong',
  useTestReqCtx({ fixtures: { User: [USER1] } }, async (ctx) => {
    const input: LoginInput = {
      emailOrUsername: USER1.email,
      password: 'wrong password',
    };

    await expect(login(undefined, { input }, ctx)).rejects.toThrowError(
      'wrong username, email, or password'
    );
  })
);
