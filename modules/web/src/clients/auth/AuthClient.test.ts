import { GraphqlClient } from './../graphql/GraphqlClient';
import { AuthClient } from './AuthClient';

let graphqlClient: GraphqlClient;
let authClient: AuthClient;
const fakeRes = { data: {} };

beforeEach(() => {
  graphqlClient = new GraphqlClient('uri');
  authClient = new AuthClient(graphqlClient);
});

it('queries whoami', async () => {
  const callSpy = jest.spyOn(graphqlClient, 'call');
  callSpy.mockResolvedValue(fakeRes);

  const res = await authClient.whoami();

  expect(res).toStrictEqual(fakeRes);
});

it('queries login', async () => {
  const callSpy = jest.spyOn(graphqlClient, 'call');
  callSpy.mockResolvedValue(fakeRes);

  const res = await authClient.login({ usernameOrEmail: 'usernameOrEmail', password: 'password' });

  expect(res).toStrictEqual(fakeRes);
});

it('queries signup', async () => {
  const callSpy = jest.spyOn(graphqlClient, 'call');
  callSpy.mockResolvedValue(fakeRes);

  const res = await authClient.signup({ username: 'username', email: 'email@domain.tld', password: 'password' });

  expect(res).toStrictEqual(fakeRes);
});
