import { configureStore } from '@reduxjs/toolkit';
import { DeepPartial } from '@stringsync/common';
import { authSlice } from './auth';
import { deviceSlice } from './device';
import { historySlice } from './history';
import { librarySlice } from './library';
import { swSlice } from './sw';
import { tagSlice } from './tag';
import { AppStore, RootState } from './types';
import { viewportSlice } from './viewport';

export const createStore = (preloadedState: DeepPartial<RootState> = {}): AppStore => {
  return configureStore({
    reducer: {
      device: deviceSlice.reducer,
      viewport: viewportSlice.reducer,
      auth: authSlice.reducer,
      history: historySlice.reducer,
      library: librarySlice.reducer,
      tag: tagSlice.reducer,
      sw: swSlice.reducer,
    },
    preloadedState,
  });
};
