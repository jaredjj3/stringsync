import {
  combineReducers,
  createStore as doCreateStore,
  applyMiddleware,
  compose,
} from 'redux';
import { getPreloadedState } from './getPreloadedState';
import thunk from 'redux-thunk';
import createApolloClient from '../util/ createApolloClient';
import viewportReducer from './modules/viewport/reducer';
import deviceReducer from './modules/device/reducer';
import authReducer from './modules/auth/reducer';

const REDUX_DEVTOOLS_KEY = '__REDUX_DEVTOOLS_EXTENSION__';

const reducer = combineReducers({
  viewport: viewportReducer,
  device: deviceReducer,
  auth: authReducer,
});

const preloadedState = getPreloadedState();

const isReduxDevtoolsAvailable = () => {
  return REDUX_DEVTOOLS_KEY in window;
};

const createStore = () => {
  const apollo = createApolloClient();
  const middlewares = [thunk.withExtraArgument({ apollo })];
  let reduxDevtools = compose;
  if (process.env.NODE_ENV !== 'production' && isReduxDevtoolsAvailable()) {
    reduxDevtools = (window as any)[REDUX_DEVTOOLS_KEY];
  }

  return doCreateStore(
    reducer,
    preloadedState,
    compose(
      applyMiddleware(...middlewares),
      reduxDevtools()
    )
  );
};

export default createStore;
