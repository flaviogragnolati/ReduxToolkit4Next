import { combineReducers } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import counter from '@/modules/Counter/counterSlice';

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE');
      return action.payload;

    default: {
      console.log('DEFAULT REDUCERS');
      const combineReducer = combineReducers({
        counter,
      });
      return combineReducer(state, action);
    }
  }
};

export default rootReducer;
