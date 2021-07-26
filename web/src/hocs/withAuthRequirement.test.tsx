import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { UserRole } from '../domain';
import { createStore } from '../store';
import { getNullAuthState } from '../store/auth/getNullAuthState';
import { getNullAuthUser } from '../store/auth/getNullAuthUser';
import { Test } from '../testing';
import { AuthRequirement } from '../util/types';
import { withAuthRequirement } from './withAuthRequirement';

describe('withAuthRequirement', () => {
  const Dummy: React.FC = (props) => <div data-testid="dummy">{props.children}</div>;

  describe('with AuthRequirement.NONE', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.NONE)(Dummy);
    });

    it('renders when logged out', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: false,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it('renders when logged in', () => {
      const store = createStore({
        auth: {
          user: {
            id: '23g23g32',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role: UserRole.STUDENT,
            username: 'username',
          },
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it('renders when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });
  });

  describe('with AuthRequirement.LOGGED_OUT', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.LOGGED_OUT)(Dummy);
    });

    it('does not render when logged in', () => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: '23h23h2h',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role: UserRole.STUDENT,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('renders when logged out', () => {
      const store = createStore({
        auth: { isPending: false, user: getNullAuthUser() },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it('does not render when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });
  });

  describe('with AuthRequirement.LOGGED_IN', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.LOGGED_IN)(Dummy);
    });

    it('renders when logged in', () => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: '23h23h2h',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role: UserRole.STUDENT,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it('does not render when logged out', () => {
      const store = createStore({
        auth: { isPending: false, user: getNullAuthUser() },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });
  });

  describe('with AuthRequirement.LOGGED_IN_AS_STUDENT', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.LOGGED_IN_AS_STUDENT)(Dummy);
    });

    it.each([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN])(
      'renders when logged in as student for greater',
      (role) => {
        const store = createStore({
          auth: {
            isPending: false,
            user: {
              id: 'g23g32g',
              confirmedAt: new Date().toJSON(),
              email: 'email@domain.tld',
              role,
              username: 'username',
            },
          },
        });
        const history = createMemoryHistory();

        const { getByTestId } = render(
          <Provider store={store}>
            <Router history={history}>
              <Component />
            </Router>
          </Provider>
        );

        expect(getByTestId('dummy')).toBeInTheDocument();
      }
    );

    it('does not render when logged out', () => {
      const store = createStore({
        auth: { isPending: false, user: getNullAuthUser() },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });
  });

  describe('with AuthRequirement.LOGGED_IN_AS_TEACHER', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.LOGGED_IN_AS_TEACHER)(Dummy);
    });

    it.each([UserRole.TEACHER, UserRole.ADMIN])('renders when logged in as teacher or greater', (role) => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: '32g23g23',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it('does not render when logged in as less than teacher', () => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: 'f32f23gg',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role: UserRole.STUDENT,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when logged out', () => {
      const store = createStore({
        auth: { isPending: false, user: getNullAuthUser() },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });
  });

  describe('with AuthRequirement.LOGGED_IN_AS_ADMIN', () => {
    let Component: React.FC;

    beforeEach(() => {
      Component = withAuthRequirement(AuthRequirement.LOGGED_IN_AS_ADMIN)(Dummy);
    });

    it('renders when logged in as admin or greater', () => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: 'g23g32g',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role: UserRole.ADMIN,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(getByTestId('dummy')).toBeInTheDocument();
    });

    it.each([UserRole.STUDENT, UserRole.TEACHER])('does not render when logged in as less than admin', (role) => {
      const store = createStore({
        auth: {
          isPending: false,
          user: {
            id: 'sadf312g',
            confirmedAt: new Date().toJSON(),
            email: 'email@domain.tld',
            role,
            username: 'username',
          },
        },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when logged out', () => {
      const store = createStore({
        auth: { isPending: false, user: getNullAuthUser() },
      });
      const history = createMemoryHistory();

      const { getByTestId } = render(
        <Provider store={store}>
          <Router history={history}>
            <Component />
          </Router>
        </Provider>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });

    it('does not render when pending', () => {
      const store = createStore({
        auth: {
          ...getNullAuthState(),
          isPending: true,
        },
      });

      const { getByTestId } = render(
        <Test store={store}>
          <Component />
        </Test>
      );

      expect(() => getByTestId('dummy')).toThrow();
    });
  });
});
