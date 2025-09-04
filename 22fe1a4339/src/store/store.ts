import { configureStore } from '@reduxjs/toolkit';
import urlsReducer from './slices/urlsSlice';
import logsReducer from './slices/logsSlice';

export const store = configureStore({
  reducer: {
    urls: urlsReducer,
    logs: logsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;