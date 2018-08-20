import thunk from 'redux-thunk';
import { applyMiddleware, combineReducers, createStore as _createStore } from 'redux';
import { 
  viewportReducer, videoReducer, sessionReducer, 
  notationsReducer, usersReducer, tagsReducer,
  behaviorReducer, uiReducer
} from './';
import { Store } from 'react-redux';

// Middleware
const middleware = applyMiddleware(thunk);

// Reducer
const reducer = combineReducers({
  behavior: behaviorReducer,
  notations: notationsReducer,
  session: sessionReducer,
  tags: tagsReducer,
  ui: uiReducer,
  users: usersReducer,
  video: videoReducer,
  viewport: viewportReducer
});

// Store
const createStore = (): Store<Store.IState> => {
  const store = _createStore(reducer, {}, middleware) as Store<Store.IState>;
  window.ss.store = store;
  return store;
}

export default createStore;
