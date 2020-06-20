import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { deviceSlice } from './device';
import { viewportSlice } from './viewport';
import { authSlice } from './auth';
import { historySlice } from './history';

export const createStore = () => {
  return configureStore({
    reducer: {
      device: deviceSlice.reducer,
      viewport: viewportSlice.reducer,
      auth: authSlice.reducer,
      history: historySlice.reducer,
    },
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['auth/authenticate', 'auth/login', 'auth/signup'],
      },
    }),
  });
};

const dummyStore = createStore();

export type AppStore = typeof dummyStore;

export type AppDispatch = typeof dummyStore.dispatch;

export type RootState = ReturnType<typeof dummyStore.getState>;
