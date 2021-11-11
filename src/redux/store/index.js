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

let store;

const makeStore = () => {
  store = configureStore({
    reducer: rootReducer,
    middleware,
  });
  return store;
};

export const wrapper = createWrapper(makeStore, {
  debug: !IS_PRODUCTION,
});
extraThunkArguments.store = store;

export default wrapper;
