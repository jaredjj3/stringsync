import { render, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import React from 'react';
import { UserRole as DomainUserRole } from '../domain';
import { $queries, UserRoles as TypegenUserRole } from '../graphql';
import { AppStore, createStore } from '../store';
import { getNullAuthUser } from '../store/auth/getNullAuthUser';
import { Test } from '../testing';
import { AuthSync } from './AuthSync';

describe('AuthSync', () => {
  let store: AppStore;

  beforeEach(() => {
    store = createStore();
  });

  it('updates auth user when logged in', async () => {
    const now = new Date();
    const whoamiSpy = jest.spyOn($queries, 'whoami');
    whoamiSpy.mockResolvedValue({
      data: {
        whoami: {
          id: '1',
          createdAt: now.toJSON(),
          updatedAt: now.toJSON(),
          email: 'email@domain.tld',
          role: TypegenUserRole.TEACHER,
          username: 'username',
          confirmedAt: now.toJSON(),
        },
      },
    });

    render(
      <Test store={store}>
        <AuthSync />
      </Test>
    );

    await waitFor(() => expect(whoamiSpy).toHaveBeenCalledTimes(1));

    expect(store.getState().auth.user).toStrictEqual({
      id: '1',
      email: 'email@domain.tld',
      username: 'username',
      role: DomainUserRole.TEACHER,
      confirmedAt: now.toJSON(),
    });
  });

  it('updates user when logged out', async () => {
    const whoamiSpy = jest.spyOn($queries, 'whoami');
    whoamiSpy.mockResolvedValue({ data: { whoami: null } });

    render(
      <Test store={store}>
        <AuthSync />
      </Test>
    );

    await waitFor(() => expect(whoamiSpy).toHaveBeenCalledTimes(1));

    expect(store.getState().auth.user).toStrictEqual(getNullAuthUser());
  });

  it('swallows errors silently', async () => {
    const whoamiSpy = jest.spyOn($queries, 'whoami');
    whoamiSpy.mockResolvedValue({ data: null, errors: [new GraphQLError('error message 1')] });

    render(
      <Test store={store}>
        <AuthSync />
      </Test>
    );

    await waitFor(() => expect(whoamiSpy).toHaveBeenCalledTimes(1));

    const state = store.getState();
    expect(state.auth.user).toStrictEqual(getNullAuthUser());
    expect(state.auth.errors).toHaveLength(0);
  });

  it('authenticates once', async () => {
    const whoamiSpy = jest.spyOn($queries, 'whoami');
    whoamiSpy.mockResolvedValue({ data: null, errors: [new GraphQLError('error message 1')] });

    const { rerender } = render(
      <Test store={store}>
        <AuthSync />
      </Test>
    );

    rerender(
      <Test store={store}>
        <AuthSync />
      </Test>
    );

    expect(whoamiSpy).toHaveBeenCalledTimes(1);
  });
});
