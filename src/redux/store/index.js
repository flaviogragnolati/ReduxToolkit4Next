import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import logger from 'redux-logger';
import rootReducer from '@/src/redux/store/rootReducer';
import notificationMiddleware from '@/src/redux/middleware/notificationMiddleware';

const ENVIRONMENT = process.env.NODE_ENV;

const IS_PRODUCTION = ENVIRONMENT === 'production';

// extra arguments for thunk
const extraThunkArguments = {};

const middleware = (getDefaultMiddleware) => {
  const defaultMiddleware = getDefaultMiddleware({
    thunk: {
      extraArgument: extraThunkArguments,
    },
    immutableCheck: !IS_PRODUCTION,
    serializableCheck: !IS_PRODUCTION,
  });

  let customMiddleware = defaultMiddleware;
  if (!IS_PRODUCTION) customMiddleware = customMiddleware.concat(logger);
  customMiddleware = customMiddleware.concat(notificationMiddleware);
  return customMiddleware;
};

const setupStore = (context) =>
  configureStore({
    reducer: rootReducer,
    middleware,
  });

const makeStore = (context) => setupStore(context);

export const wrapper = createWrapper(makeStore, {
  debug: !IS_PRODUCTION,
});

export default wrapper;
