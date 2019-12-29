import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { message } from 'antd';
import { UserRoles } from 'common/types';
import { compareUserRoles } from '../../util';
import { useHistory } from 'react-router';

export enum AuthRequirements {
  NONE,
  LOGGED_IN,
  LOGGED_OUT,
  LOGGED_IN_AS_STUDENT,
  LOGGED_IN_AS_TEACHER,
  LOGGED_IN_AS_ADMIN,
}

export const withAuthRequirement = (authReqs: AuthRequirements) =>
  function<P>(Component: React.ComponentType<P>): React.FC<P> {
    return (props) => {
      const isLoggedIn = useSelector<RootState, boolean>(
        (state) => state.auth.isLoggedIn
      );
      const userRole = useSelector<RootState, UserRoles>(
        (state) => state.auth.user.role
      );

      const meetsAuthReqs = useRef(true);
      switch (authReqs) {
        case AuthRequirements.NONE:
          meetsAuthReqs.current = true;
          break;
        case AuthRequirements.LOGGED_IN:
          meetsAuthReqs.current = isLoggedIn;
          break;
        case AuthRequirements.LOGGED_OUT:
          meetsAuthReqs.current = !isLoggedIn;
          break;
        case AuthRequirements.LOGGED_IN_AS_STUDENT:
          meetsAuthReqs.current =
            isLoggedIn && compareUserRoles(userRole, 'student') >= 0;
          break;
        case AuthRequirements.LOGGED_IN_AS_TEACHER:
          meetsAuthReqs.current =
            isLoggedIn && compareUserRoles(userRole, 'teacher') >= 0;
          break;
        case AuthRequirements.LOGGED_IN_AS_ADMIN:
          meetsAuthReqs.current =
            isLoggedIn && compareUserRoles(userRole, 'admin') >= 0;
          break;
      }

      const history = useHistory();
      useEffect(() => {
        if (meetsAuthReqs.current) {
          return;
        }
        const navigateTo = (path: string) => {
          history.push(path);
        };
        switch (authReqs) {
          case AuthRequirements.NONE:
            break;
          case AuthRequirements.LOGGED_IN:
            message.error('must be logged in');
            navigateTo('login');
            break;
          case AuthRequirements.LOGGED_OUT:
            navigateTo('library');
            break;
          case AuthRequirements.LOGGED_IN_AS_STUDENT:
            message.error('must be logged in as a student');
            navigateTo(isLoggedIn ? 'library' : 'login');
            break;
          case AuthRequirements.LOGGED_IN_AS_TEACHER:
            message.error('must be logged in as a teacher');
            navigateTo(isLoggedIn ? 'library' : 'login');
            break;
          case AuthRequirements.LOGGED_IN_AS_ADMIN:
            message.error('must be logged in as a admin');
            navigateTo(isLoggedIn ? 'library' : 'login');
            break;
        }
      }, [history, isLoggedIn, meetsAuthReqs]);

      return meetsAuthReqs.current ? <Component {...props} /> : null;
    };
  };
